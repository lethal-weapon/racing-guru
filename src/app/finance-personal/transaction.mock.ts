import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  TRANSACTION_METHODS,
  TRANSACTION_TYPES
} from '../model/transaction.model';

export const MOCKED_TRANSACTIONS = [
  {
    id: '62398112aabbcccc',
    date: '2024-09-15',
    type: TRANSACTION_TYPES[0],
    category: INCOME_CATEGORIES[0],
    method: TRANSACTION_METHODS[3],
    amount: 25895,
    remark: 'OOCL',
  },
  {
    id: '781205aeeebbdddd',
    date: '2024-09-09',
    type: TRANSACTION_TYPES[0],
    category: INCOME_CATEGORIES[2],
    method: TRANSACTION_METHODS[3],
    amount: 32.5,
    remark: 'Standard Chartered',
  },
  {
    id: '9283aefb232abcde',
    date: '2024-09-02',
    type: TRANSACTION_TYPES[1],
    category: EXPENSE_CATEGORIES[2],
    method: TRANSACTION_METHODS[0],
    amount: 50,
    remark: 'Supermarket - Drinks',
  },
  {
    id: 'aebc128ffabc1245',
    date: '2024-09-02',
    type: TRANSACTION_TYPES[1],
    category: EXPENSE_CATEGORIES[2],
    method: TRANSACTION_METHODS[1],
    amount: 16.5,
    remark: 'Circle K - Coffee',
  },
]
