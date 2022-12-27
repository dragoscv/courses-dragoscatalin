import React from 'react'
import Router, { useRouter } from 'next/router'
import { getFirestore, addDoc, setDoc, doc, collection, getDoc, getDocs, query, onSnapshot, deleteDoc } from "firebase/firestore";
import { app } from '../../../firebase.config';
import ReactPlayer from 'react-player'
import moment from 'moment/moment';
import screenfull from 'screenfull';

const db = getFirestore(app)

const Lesson = () => {
    const router = useRouter()
    const { courseId, lessonId } = router.query
    const [lesson, setLesson] = React.useState(null)
    //set state for lesson's video controls
    const [controls, setControls] = React.useState(true)
    const [playing, setPlaying] = React.useState(true)
    const [muted, setMuted] = React.useState(false)
    const [volume, setVolume] = React.useState(0.8)
    const [played, setPlayed] = React.useState(0)
    const [loaded, setLoaded] = React.useState(0)
    const [duration, setDuration] = React.useState(0)
    const [loop, setLoop] = React.useState(false)
    const [playbackRate, setPlaybackRate] = React.useState(1.0)
    const [pip, setPip] = React.useState(false)
    const [light, setLight] = React.useState(false)
    const [seeking, setSeeking] = React.useState(false)
    const player = React.useRef(null)

    const handlePlayPause = () => {
        setPlaying(!playing)
    }

    const handleStop = () => {
        setPlayed(0)
        setLoaded(0)
        setPlaying(false)
    }

    const handleToggleControls = () => {
        setControls(!controls)
    }

    const handleToggleLight = () => {
        setLight(!light)
    }

    const handleToggleLoop = () => {
        setLoop(!loop)
    }

    const handleVolumeChange = (e) => {
        setVolume(parseFloat(e.target.value))
    }

    const handleToggleMuted = () => {
        setMuted(!muted)
    }

    const handleSetPlaybackRate = (e) => {
        setPlaybackRate(parseFloat(e.target.value))
    }

    const handleTogglePIP = () => {
        setPip(!pip)
    }

    const handlePlay = () => {
        console.log('onPlay')
        setPlaying(true)
    }

    const handleEnablePIP = () => {
        console.log('onEnablePIP')
        setPip(true)
    }

    const handleDisablePIP = () => {
        console.log('onDisablePIP')
        setPip(false)
    }

    const handlePause = () => {
        console.log('onPause')
        setPlaying(false)
    }

    const handleSeekMouseDown = (e) => {
        setSeeking(true)
    }

    const handleSeekChange = (e) => {
        setPlayed(parseFloat(e.target.value))
    }

    const handleSeekMouseUp = (e) => {
        setSeeking(false)
        player.current.seekTo(parseFloat(e.target.value))
    }

    const handleProgress = (state) => {
        console.log('onProgress', state)
        // We only want to update time slider if we are not currently seeking
        if (!seeking) {
            setPlayed(state.played)
        }
        setLoaded(state.loaded)
    }

    const handleEnded = () => {
        console.log('onEnded')
        setPlaying(false)
    }

    const handleDuration = (duration) => {
        console.log('onDuration', duration)
        setDuration(duration)
    }

    const handleToggleFullscreen = () => {
        screenfull.request(player)
    }

    React.useEffect(() => {
        if (!courseId || !lessonId) return
        const queryLesson = doc(db, `courses/${courseId}/lessons/${lessonId}`)
        getDoc(queryLesson).then((doc) => {
            if (doc.exists()) {
                const data = doc.data()
                data.id = doc.id
                console.log('Document data:', data)
                setLesson(data)
            } else {
                console.log('No such document!')
            }
        }).catch((error) => {
            console.log('Error getting document:', error)
        })
    }, [courseId, lessonId])


    return (
        <>
            <div className='container'>
                <h1>Lesson</h1>
                {lesson && (
                    <>
                        <h2>{lesson.title}</h2>
                        <p>{lesson.description}</p>
                        <p>{moment(lesson.createdAt.toDate()).format('DD/MM/YYYY')}</p>
                        <div className='player-wrapper py-4'>
                            <ReactPlayer
                                ref={player}
                                width="300px"
                                height="200px"
                                playing={playing}
                                controls={controls}
                                light={light}
                                loop={loop}
                                playbackRate={playbackRate}
                                volume={volume}
                                muted={muted}
                                pip={pip}
                                onPlay={handlePlay}
                                onEnablePIP={handleEnablePIP}
                                onDisablePIP={handleDisablePIP}
                                onPause={handlePause}
                                onBuffer={() => console.log('onBuffer')}
                                onSeek={e => console.log('onSeek', e)}
                                onEnded={handleEnded}
                                onError={e => console.log('onError', e)}
                                onProgress={handleProgress}
                                onDuration={handleDuration}
                                onReady={() => console.log('onReady')}
                                url={[{ src: lesson.video, type: 'video/webm' }]}
                            />
                        </div>
                        <div className='player-controls flex flex-col hidden'>
                            <div className='flex flex-row w-full'>
                                <input
                                    type='range' min={0} max={0.999999} step='any'
                                    value={played}
                                    onMouseDown={handleSeekMouseDown}
                                    onChange={handleSeekChange}
                                    onMouseUp={handleSeekMouseUp}
                                    className='w-full'
                                />
                            </div>
                            <div className='flex flex-row justify-between'>
                                <button onClick={handlePlayPause}>{playing ? 'Pause' : 'Play'}</button>
                                <button onClick={handleStop}>Stop</button>
                                <button onClick={handleToggleControls}>Toggle Controls</button>
                            </div>
                            <div className='flex flex-row justify-between'>
                                {/* <button onClick={handleToggleLight}>Toggle Light</button> */}
                                {/* <button onClick={handleToggleLoop}>Toggle Loop</button> */}
                                <button onClick={handleToggleMuted}>{muted ? 'Unmute' : 'Mute'}</button>
                                <button onClick={handleToggleFullscreen}>Toggle Fullscreen</button>
                                <button onClick={handleTogglePIP}>{pip ? 'Disable PiP' : 'Enable PiP'}</button>
                            </div>
                            <div className='flex flex-row justify-between'>
                            </div>
                            <div className='flex flex-row w-full'>
                                <label>Volume</label>
                                <input
                                    type='range' min={0} max={1} step='any'
                                    value={volume}
                                    onChange={handleVolumeChange}
                                />
                            </div>
                            <div className='flex flex-row w-full'>
                                <label>Playback Rate</label>
                                <input
                                    type='range' min={0.5} max={2} step='any'
                                    value={playbackRate}
                                    onChange={handleSetPlaybackRate}
                                />
                            </div>
                        </div>

                    </>
                )}
            </div>
        </>
    )
}

export default Lesson