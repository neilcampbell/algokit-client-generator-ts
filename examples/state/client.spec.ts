import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { beforeEach, describe, expect, test } from '@jest/globals'
import { StateAppClient } from './client'

describe('state typed client', () => {
  const localnet = algorandFixture()
  beforeEach(localnet.beforeEach, 10_000)

  test('Exposes state correctly', async () => {
    const { algod, indexer, testAccount } = localnet.context
    const client = new StateAppClient(
      {
        resolveBy: 'creatorAndName',
        sender: testAccount,
        creatorAddress: testAccount.addr,
        findExistingUsing: indexer,
      },
      algod,
    )
    await client.deploy({ deployTimeParams: { VALUE: 1 } })

    await client.setGlobal({ int1: 1, int2: 2, bytes1: 'asdf', bytes2: new Uint8Array([1, 2, 3, 4]) })

    const globalState = await client.getGlobalState()

    expect(globalState.int1?.asNumber()).toBe(1)
    expect(globalState.int2?.asNumber()).toBe(2)
    expect(globalState.bytes1?.asString()).toBe('asdf')
    expect(globalState.bytes2?.asByteArray()).toEqual(new Uint8Array([1, 2, 3, 4]))

    await client.optIn.optIn([])
    await client.setLocal({ int1: 1, int2: 2, bytes1: 'asdf', bytes2: new Uint8Array([1, 2, 3, 4]) })

    const localState = await client.getLocalState(testAccount)

    expect(localState.local_int1?.asNumber()).toBe(1)
    expect(localState.local_int2?.asNumber()).toBe(2)
    expect(localState.local_bytes1?.asString()).toBe('asdf')
    expect(localState.local_bytes2?.asByteArray()).toEqual(new Uint8Array([1, 2, 3, 4]))
  })
})
