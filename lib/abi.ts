export const TOKEN_FACTORY_ABI = [
  // Write functions
  {
    name: 'createToken',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: '_name',        type: 'string' },
      { name: '_symbol',      type: 'string' },
      { name: '_totalSupply', type: 'uint256' },
      { name: '_description', type: 'string' },
      { name: '_website',     type: 'string' },
    ],
    outputs: [{ name: 'tokenAddress', type: 'address' }],
  },
  {
    name: 'withdrawFees',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'setCreationFee',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'newFee', type: 'uint256' }],
    outputs: [],
  },
  // Read functions
  {
    name: 'getTokenCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getTokens',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'offset', type: 'uint256' },
      { name: 'limit',  type: 'uint256' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'tokenAddress', type: 'address' },
          { name: 'creator',      type: 'address' },
          { name: 'name',         type: 'string' },
          { name: 'symbol',       type: 'string' },
          { name: 'totalSupply',  type: 'uint256' },
          { name: 'description',  type: 'string' },
          { name: 'website',      type: 'string' },
          { name: 'createdAt',    type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'creationFee',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'owner',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'atlasWallet',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  // Events
  {
    name: 'TokenCreated',
    type: 'event',
    inputs: [
      { name: 'tokenAddress', type: 'address', indexed: true },
      { name: 'creator',      type: 'address', indexed: true },
      { name: 'name',         type: 'string',  indexed: false },
      { name: 'symbol',       type: 'string',  indexed: false },
      { name: 'totalSupply',  type: 'uint256', indexed: false },
      { name: 'timestamp',    type: 'uint256', indexed: false },
    ],
  },
] as const
