import react from "react";
import { BrowserRouter,Routes,Route,Navigate } from "react-router-dom";
import Layout from './components/Layout.jsx'

import Home from "./pages/Home.jsx";
import FeedVideos from "./pages/FeedVideos.jsx";
import FeedChannels from "./pages/FeedChannels.jsx";
import Channels from "./pages/Channels.jsx";
import ChannelVideos from "./pages/ChannelVideos.jsx";
import ChannelTweets from "./pages/ChannelTweets.jsx";
import ChannelPlaylists from "./pages/ChannelPlaylists.jsx";
import Playlists from "./pages/Playlists.jsx";
import OpenPlaylist from "./pages/OpenPlaylist.jsx";
import LikedVideos from "./pages/LikedVideos.jsx";
import WatchHistory from "./pages/WatchHistory.jsx";
import WatchVideo from "./pages/WatchVideo.jsx";
import ViewTweet from "./pages/ViewTweet.jsx";
import Tweets from "./pages/Tweets.jsx";
import PostVideo from "./pages/PostVideo.jsx";
import PostTweet from "./pages/PostTweet.jsx";
import EditVideo from "./pages/EditVideo.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";

const App=()=>{
    return(
        <BrowserRouter>
            <Routes>
                <Route element={<Layout/>}>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/signin" element={<SignIn/>}/>
                    <Route path="/signup" element={<SignUp/>}/>
                    <Route path="/:username">
                        <Route path="videos" element={<ChannelVideos/>}/>
                        <Route path="tweets" element={<ChannelTweets/>}/>
                        <Route path="playlists" element={<ChannelPlaylists/>}/>
                    </Route>
                    <Route path="/watch" element={<WatchVideo/>} />
                    <Route path="/view" element={<ViewTweet/>}/>
                    <Route path="/playlist" element={<OpenPlaylist/>}/>
                    <Route path="/search" element={<Home/>}/>
                    <Route path="/search/channels" element={<Channels/>}/>
                    <Route path="/search/tweets" element={<Tweets/>}/>
                    <Route path="/search/playlists" element={<Playlists/>}/>
                    <Route path="/verify-email" element={<VerifyEmail/>}/>
                    <Route path="/you/history" element={<WatchHistory/>}/>
                    <Route path="/you/liked-videos" element={<LikedVideos/>}/>
                    <Route path="/post/video" element={<PostVideo/>}/>
                    <Route path="/post/tweet" element={<PostTweet/>}/>
                    <Route path="/edit/video" element={<EditVideo/>}/>
                    <Route path="/subscriptions" element={<FeedVideos/>}/>
                    <Route path="/subscriptions/channels" element={<FeedChannels/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
export default App;