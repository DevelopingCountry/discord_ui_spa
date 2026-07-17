import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import LoginPage from "@/pages/Login";
import KakaoRedirectPage from "@/pages/KakaoCallback";
import ChannelsLayout from "@/components/layout/ChannelsLayout";
import ChannelsMeLayout from "@/pages/ChannelsMeLayout";
import ChannelsMeHome from "@/pages/ChannelsMeHome";
import DmChatPage from "@/pages/DmChatPage";
import ChannelsServerLayout from "@/pages/ChannelsServerLayout";
import ChannelsServerHome from "@/pages/ChannelsServerHome";
import ChannelPage from "@/pages/ChannelPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/kakao" element={<KakaoRedirectPage />} />
      <Route element={<ChannelsLayout />}>
        <Route element={<ChannelsMeLayout />}>
          <Route path="/channels/me" element={<ChannelsMeHome />} />
          <Route path="/channels/me/:dmId" element={<DmChatPage />} />
        </Route>
        <Route path="/channels/:serverId" element={<ChannelsServerLayout />}>
          <Route index element={<ChannelsServerHome />} />
          <Route path=":channelId" element={<ChannelPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
