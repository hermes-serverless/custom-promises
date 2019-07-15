import moment from 'moment'
import { TimedWaiter, TimeoutError } from '..'

test('Simple resolve test', async () => {
  const waiter: TimedWaiter<number> = new TimedWaiter(1000)
  setTimeout(() => waiter.resolve(5), 20)
  await expect(waiter.finish()).resolves.toBe(5)
})

test('Simple rejection', async () => {
  const error = new Error('Simple error')
  const waiter = new TimedWaiter(1000)
  setTimeout(() => waiter.reject(error), 20)
  await expect(waiter.finish()).rejects.toThrow(error)
})

describe('Using .then', () => {
  test('Then on resolve', async () => {
    const resolved = jest.fn()
    const rejected = jest.fn()
    const waiter = new TimedWaiter(1000)
    waiter.then(resolved, rejected)

    setTimeout(() => waiter.resolve(5), 20)

    const check = async () => {
      await expect(waiter.finish()).resolves.toBe(5)
      expect(resolved.mock.calls.length).toBe(1)
      expect(resolved.mock.calls[0][0]).toBe(5)
      expect(rejected.mock.calls.length).toBe(0)
    }
    await check()
    await check()
  })

  test('Then on reject', async () => {
    const resolved = jest.fn()
    const rejected = jest.fn()

    const error = new Error('Simple error')
    const waiter = new TimedWaiter(1000)
    waiter.then(resolved, rejected)

    setTimeout(() => waiter.reject(error), 20)

    const check = async () => {
      await expect(waiter.finish()).rejects.toThrow(error)
      expect(resolved.mock.calls.length).toBe(0)
      expect(rejected.mock.calls.length).toBe(1)
      expect(rejected.mock.calls[0][0]).toBe(error)
    }
    await check()
    await check()
  })

  test('2 thens on resolve', async () => {
    const resolved1 = jest.fn()
    const resolved2 = jest.fn()
    const rejected1 = jest.fn()
    const rejected2 = jest.fn()
    const waiter = new TimedWaiter(1000)
    waiter.then(resolved1, rejected1)
    waiter.then(resolved2, rejected2)

    setTimeout(() => waiter.resolve(5), 20)

    const check = async () => {
      await expect(waiter.finish()).resolves.toBe(5)
      expect(resolved1.mock.calls.length).toBe(1)
      expect(resolved1.mock.calls[0][0]).toBe(5)
      expect(resolved2.mock.calls.length).toBe(1)
      expect(resolved2.mock.calls[0][0]).toBe(5)
      expect(rejected1.mock.calls.length).toBe(0)
      expect(rejected2.mock.calls.length).toBe(0)
    }
    await check()
    await check()
  })

  test('2 thens on reject', async () => {
    const resolved1 = jest.fn()
    const resolved2 = jest.fn()
    const rejected1 = jest.fn()
    const rejected2 = jest.fn()
    const waiter = new TimedWaiter(1000)
    waiter.then(resolved1, rejected1)
    waiter.then(resolved2, rejected2)

    const error = new Error('Simple error')
    setTimeout(() => waiter.reject(error), 20)

    const check = async () => {
      await expect(waiter.finish()).rejects.toThrow(error)
      expect(resolved1.mock.calls.length).toBe(0)
      expect(resolved2.mock.calls.length).toBe(0)
      expect(rejected1.mock.calls.length).toBe(1)
      expect(rejected1.mock.calls[0][0]).toBe(error)
      expect(rejected2.mock.calls.length).toBe(1)
      expect(rejected2.mock.calls[0][0]).toBe(error)
    }
    await check()
    await check()
  })
})

describe('Timeout rejection', () => {
  test('Simple timeout', async () => {
    const resolved = jest.fn()
    const rejected = jest.fn(err => {
      expect(err).toBeInstanceOf(TimeoutError)
      expect(moment().diff(start)).toBeLessThanOrEqual(200 * 1.2)
    })
    const start = moment()
    const waiter = new TimedWaiter(200)

    expect.assertions(10)
    waiter.then(resolved, rejected)

    const check = async () => {
      await expect(waiter.finish()).rejects.toThrow(TimeoutError)
      expect(rejected.mock.calls.length).toBe(1)
      expect(rejected.mock.calls[0][0]).toBeInstanceOf(TimeoutError)
      expect(resolved.mock.calls.length).toBe(0)
    }
    await check()
    await check()
  })
})
