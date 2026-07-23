import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  name: string;
  avatarKey: string;
}

const initialState: UserState = {
  name: 'Alex Rivera',
  avatarKey: 'profile_avatar',
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    updateAvatar: (state, action: PayloadAction<string>) => {
      state.avatarKey = action.payload;
    },
  },
});

export const { updateName, updateAvatar } = userSlice.actions;
export default userSlice.reducer;
