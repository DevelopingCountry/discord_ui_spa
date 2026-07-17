import ChatMessage from "@/components/friend/chat-message";
import SearchBar from "@/components/friend/search-bar";
import { useActiveStore, useSearchStore } from "@/components/friend/useSearchStore";
import { useFriendsQuery } from "@/components/friend/use-friends-query";

const SearchFriend = () => {
  const { data: friendsData } = useFriendsQuery();
  const { isActive } = useActiveStore();
  const { searchText } = useSearchStore();
  const filteredActiveFriends = friendsData?.filter((friend) => {
    if (isActive === "모두") {
      return friend.status === "ACCEPTED";
    }
    return friend.status === "PENDING";
  });
  const filteredFriends = filteredActiveFriends?.filter((friend) =>
    friend.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div className={"flex-1"}>
      <SearchBar />

      <div className={"bg-discord1and4 flex-1 overflow-y-auto max-h-[calc(100vh-82px)] custom-scrollbar"}>
        <ul>
          {filteredFriends?.map((friend, index) => (
            <li key={index}>
              <ChatMessage
                name={friend.name}
                status={friend.status}
                id={friend.friendId}
                friendId={friend.friendId}
                isSender={friend.isSender}
                isActive={isActive}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SearchFriend;
