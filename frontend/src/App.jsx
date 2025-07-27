
import { useRef } from 'react';
import './App.css'
import VideoPlayer from './components/VideoPlayer'
import videojs from 'video.js';

function App() {

  const playerRef = useRef(null);
  const vidoeUrl = 'http://localhost:5000/uploads/serve/e92a047a-b6f9-46c1-8c6b-79ad24eb4a2e/index.m3u8';


  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [{
      // src: '/path/to/video.mp4',
      // type: 'video/mp4'
      src: vidoeUrl,
      type: "application/x-mpegURL"
    }]
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on('waiting', () => {
      // eslint-disable-next-line no-undef
      videojs.log('player is waiting');
    });

    player.on('dispose', () => {
      // eslint-disable-next-line no-undef
      videojs.log('player will dispose');
    });
  };

  return (
    <>
      <div>
        <VideoPlayer options={videoJsOptions} onReady={handlePlayerReady} />
      </div>
    </>
  )
}

export default App
