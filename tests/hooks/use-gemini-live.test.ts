import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useGeminiLive } from '../../src/hooks/use-gemini-live';

vi.mock('../../src/lib/api/global-ai-credential-api', () => ({
  getRawAiCredentialKey: vi.fn().mockResolvedValue('test-api-key'),
}));

describe('useGeminiLive', () => {
  let originalWebSocket: any;
  let originalAudioContext: any;
  let originalMediaDevices: any;

  beforeEach(() => {
    // Save original globals
    originalWebSocket = global.WebSocket;
    originalAudioContext = global.AudioContext;
    originalMediaDevices = navigator.mediaDevices;

    // Mock WebSocket
    global.WebSocket = vi.fn().mockImplementation(() => ({
      close: vi.fn(),
      send: vi.fn(),
      readyState: 1, // OPEN
    })) as any;

    // Mock AudioContext
    class MockAudioContext {
      close = vi.fn();
      createBuffer = vi.fn();
      createBufferSource = vi.fn().mockReturnValue({ start: vi.fn(), connect: vi.fn() });
      audioWorklet = { addModule: vi.fn().mockResolvedValue(true) };
      createMediaStreamSource = vi.fn().mockReturnValue({ connect: vi.fn() });
      destination = {};
      currentTime = 0;
    }
    global.AudioContext = MockAudioContext as any;
    (window as any).AudioContext = MockAudioContext as any;

    // Mock AudioWorkletNode
    class MockAudioWorkletNode {
      port = { onmessage: null, postMessage: vi.fn() };
      connect = vi.fn();
      disconnect = vi.fn();
    }
    (global as any).AudioWorkletNode = MockAudioWorkletNode;
    (window as any).AudioWorkletNode = MockAudioWorkletNode;

    // Mock MediaDevices
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }]
        }),
      },
    });
  });

  afterEach(() => {
    // Restore globals
    global.WebSocket = originalWebSocket;
    global.AudioContext = originalAudioContext;
    Object.defineProperty(navigator, 'mediaDevices', { writable: true, value: originalMediaDevices });
  });

  it('should prevent memory leaks by cleaning up on unmount', () => {
    const { unmount, result } = renderHook(() => useGeminiLive());
    
    // Unmounting should not throw any errors even if call hasn't started
    expect(() => unmount()).not.toThrow();
  });

  it('should include googleSearch tool in setup message on startCall', async () => {
    let wsInstance: any;
    class MockWebSocket {
      close = vi.fn();
      send = vi.fn();
      readyState = 1;
      onopen: (() => void) | null = null;
      constructor() {
        wsInstance = this;
      }
    }
    vi.stubGlobal('WebSocket', MockWebSocket);
    (window as any).WebSocket = MockWebSocket;

    const onError = vi.fn();
    const { result } = renderHook(() => useGeminiLive({
      systemInstruction: 'Test instruction',
      voiceName: 'Aoede',
      onError,
    }));

    await act(async () => {
      await result.current.startCall();
    });

    // Trigger onopen
    expect(wsInstance).toBeDefined();
    await act(async () => {
      await wsInstance.onopen();
    });

    expect(wsInstance.send).toHaveBeenCalled();
    const sentData = JSON.parse(wsInstance.send.mock.calls[0][0]);
    expect(sentData.setup).toBeDefined();
    expect(sentData.setup.tools).toEqual([{ googleSearch: {} }]);
  });
});
