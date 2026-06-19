/**
 * Frontend tests: useDebounce hook
 */
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useDebounce from '../hooks/useDebounce';

describe('useDebounce', () => {
  // Use fake timers so we don't have to wait real milliseconds
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('does NOT update immediately when value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 300 } }
    );

    rerender({ value: 'world', delay: 300 });

    // Before timer fires, still old value
    expect(result.current).toBe('hello');
  });

  it('updates after the specified delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 300 } }
    );

    rerender({ value: 'world', delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('world');
  });

  it('resets the timer when value changes again before delay fires', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    );

    rerender({ value: 'b', delay: 300 });
    act(() => { vi.advanceTimersByTime(200); }); // Not enough time

    rerender({ value: 'c', delay: 300 });
    act(() => { vi.advanceTimersByTime(200); }); // Still not enough — timer reset

    expect(result.current).toBe('a'); // Still original

    act(() => { vi.advanceTimersByTime(100); }); // Now 300ms since last change
    expect(result.current).toBe('c');
  });

  it('works with a custom delay of 0', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 0 } }
    );

    rerender({ value: 'world', delay: 0 });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toBe('world');
  });

  it('uses default delay of 300ms when none provided', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'hello' } }
    );

    rerender({ value: 'world' });

    act(() => { vi.advanceTimersByTime(299); });
    expect(result.current).toBe('hello');

    act(() => { vi.advanceTimersByTime(1); });
    expect(result.current).toBe('world');
  });
});
