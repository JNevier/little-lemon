import { renderHook, act } from '@testing-library/react';
import useLocalStorage from './useLocalStorage';

// Each test starts with empty storage, so tests can't affect each other.
beforeEach(() => {
  localStorage.clear();
});

// Some tests replace localStorage methods with fakes. CRA resets fakes between tests, but doesn't
// put the real methods back; restoreAllMocks does.
afterEach(() => {
  jest.restoreAllMocks();
});

test('starts with the initial value when nothing is saved', () => {
  const { result } = renderHook(() => useLocalStorage('test-key', ['start']));
  expect(result.current[0]).toEqual(['start']);
});

test('reads a value that was saved earlier', () => {
  localStorage.setItem('test-key', JSON.stringify(['saved']));

  const { result } = renderHook(() => useLocalStorage('test-key', []));

  expect(result.current[0]).toEqual(['saved']);
});

test('saves the new value when it changes', () => {
  const { result } = renderHook(() => useLocalStorage('test-key', []));

  // act() makes React finish the update (and its effect) before we check.
  act(() => {
    result.current[1](['new']);
  });

  expect(result.current[0]).toEqual(['new']);
  expect(JSON.parse(localStorage.getItem('test-key'))).toEqual(['new']);
});

test('falls back to the initial value when the saved text is broken', () => {
  localStorage.setItem('test-key', '{not valid json');

  const { result } = renderHook(() => useLocalStorage('test-key', []));

  expect(result.current[0]).toEqual([]);
});

test('keeps working when the browser blocks storage', () => {
  // Make every read and write throw, like a browser that blocks storage.
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('Storage is blocked');
  });
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Storage is blocked');
  });

  const { result } = renderHook(() => useLocalStorage('test-key', []));
  expect(result.current[0]).toEqual([]);

  // Changing the value still works for this visit, even though it can't be saved.
  act(() => {
    result.current[1](['kept in memory']);
  });
  expect(result.current[0]).toEqual(['kept in memory']);
});
