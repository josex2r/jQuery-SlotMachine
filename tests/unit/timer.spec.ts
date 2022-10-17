import Timer from '../../lib/timer';

describe('Timer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('runs', () => {
    const mock = jest.fn();
    const timer = new Timer(mock, 100);

    expect(timer.running).toBeTruthy();

    jest.advanceTimersByTime(101);

    expect(timer.running).toBeFalsy();
    expect(mock).toHaveBeenCalled();
  });

  it('can be paused', () => {
    const mock = jest.fn();
    const timer = new Timer(mock, 100);

    expect(timer.running).toBeTruthy();

    timer.pause();
    jest.advanceTimersByTime(100);

    expect(timer.running).toBeFalsy();
    expect(mock).not.toHaveBeenCalled();
  });

  it('can be resumed', () => {
    const mock = jest.fn();
    const timer = new Timer(mock, 100);

    expect(timer.running).toBeTruthy();

    jest.advanceTimersByTime(50);
    timer.pause();
    timer.resume();
    jest.advanceTimersByTime(51);

    expect(timer.running).toBeFalsy();
    expect(mock).toHaveBeenCalled();
  });

  it('can be cancelled', () => {
    const mock = jest.fn();
    const timer = new Timer(mock, 100);

    expect(timer.running).toBeTruthy();

    timer.cancel();
    jest.advanceTimersByTime(101);

    expect(timer.running).toBeFalsy();
    expect(mock).not.toHaveBeenCalled();
  });

  it('can be restarted', () => {
    const mock = jest.fn();
    const timer = new Timer(mock, 100);

    expect(timer.running).toBeTruthy();

    timer.cancel();
    jest.advanceTimersByTime(90);
    timer.reset();
    jest.advanceTimersByTime(50);

    expect(mock).not.toHaveBeenCalled();
    jest.advanceTimersByTime(51);

    expect(timer.running).toBeFalsy();
    expect(mock).toHaveBeenCalled();
  });
});
