export type DmList = { dmId: string; targetId: string; targetImageUrl: string; targetNickname: string };
export type friendsDataType = {
  friendId: string;
  name: string;
  imageUrl: string;
  status: string;
  isSender: boolean;
};
export type channel = { id: string; name: string; type: string; creatorId: string };
export type server = { id: string; name: string; imageUrl: string; alarm?: boolean; hostId: string };
export type Profile = {
  id: string;
  email: string;
  nickname: string;
  imageUrl: string;
};
