import { renderHook, waitFor } from '@testing-library/react';
import useFetch from './useFetch';

// The test environment has no real fetch, and we don't want real network calls anyway.
// Each test puts its own fake fetch on `global`; this removes it afterwards so tests don't affect each other.
afterEach(() => {
  delete global.fetch;
});

test('returns the data and stops loading when the request succeeds', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => [{ id: 'tea', name: 'Mint Tea' }],
  });

  // renderHook runs a hook inside a tiny test component, so we can read what it returns.
  const { result } = renderHook(() => useFetch('/data/menu.json'));

  // Before the reply arrives, it's loading.
  expect(result.current.loading).toBe(true);
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data).toEqual([{ id: 'tea', name: 'Mint Tea' }]);
  expect(result.current.error).toBeNull();
  expect(global.fetch).toHaveBeenCalledWith('/data/menu.json', expect.objectContaining({ signal: expect.anything() }));
});

test('returns an error when the server replies with an HTTP error', async () => {
  // A 404 doesn't make fetch fail by itself; the hook must check response.ok.
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });

  const { result } = renderHook(() => useFetch('/missing.json'));

  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.error).toBeInstanceOf(Error);
  expect(result.current.error.message).toBe('Request failed with status 404');
  expect(result.current.data).toBeNull();
});

test('returns an error when the network request fails', async () => {
  global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));

  const { result } = renderHook(() => useFetch('/data/menu.json'));

  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.error.message).toBe('Failed to fetch');
});

test('aborts the old request when the url changes, without showing an error', async () => {
  // A fake fetch that behaves like the real one: the first request rejects with an AbortError
  // when its signal is aborted; the second request answers normally.
  global.fetch = jest.fn((url, { signal }) => {
    if (url === '/first.json') {
      return new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      });
    }
    return Promise.resolve({ ok: true, json: async () => ['second'] });
  });

  // initialProps / rerender let us change the hook's url, like a component getting a new prop.
  const { result, rerender } = renderHook(({ url }) => useFetch(url), {
    initialProps: { url: '/first.json' },
  });
  rerender({ url: '/second.json' });

  await waitFor(() => expect(result.current.loading).toBe(false));
  // The first request was cancelled by the cleanup...
  const firstSignal = global.fetch.mock.calls[0][1].signal;
  expect(firstSignal.aborted).toBe(true);
  // ...and the cancel didn't count as an error. Only the second request's data is shown.
  expect(result.current.error).toBeNull();
  expect(result.current.data).toEqual(['second']);
});

test('aborts the request when the component goes away', () => {
  global.fetch = jest.fn(() => new Promise(() => {}));

  const { unmount } = renderHook(() => useFetch('/data/menu.json'));
  unmount();

  const signal = global.fetch.mock.calls[0][1].signal;
  expect(signal.aborted).toBe(true);
});
