import { act, renderHook, waitFor } from '@testing-library/react';
import { useCommunityMessages } from './useCommunityMessages';
import api from '../lib/api';

jest.mock('../lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../lib/supabaseClient', () => ({
  __esModule: true,
  supabase: {
    channel: jest.fn(() => ({
      on: jest.fn(function () {
        return this;
      }),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  },
}));

describe('useCommunityMessages', () => {
  beforeEach(() => {
    api.get.mockResolvedValue({
      messages: [
        {
          id: 'msg-1',
          user_id: 'user-1',
          user_name: 'Jane',
          content: 'Hello there',
          created_at: '2025-01-01T00:00:00.000Z',
          edited_at: null,
          deleted: false,
        },
      ],
      next_cursor: null,
    });
    api.delete.mockResolvedValue({
      id: 'msg-1',
      user_id: 'user-1',
      user_name: 'Jane',
      content: 'Hello there',
      created_at: '2025-01-01T00:00:00.000Z',
      edited_at: null,
      deleted: true,
    });
  });

  it('marks a message as deleted when deleteMessage is called', async () => {
    const { result } = renderHook(() => useCommunityMessages('community-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteMessage('msg-1');
    });

    expect(result.current.messages[0].deleted).toBe(true);
  });
});
