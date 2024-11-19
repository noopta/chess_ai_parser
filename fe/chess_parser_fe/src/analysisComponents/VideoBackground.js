import backgroundVideo from './chess_game_ai_2.mp4';

export default function VideoBackground({ isVisible }) {
    return (
        <video
        autoPlay
        loop
        muted
        preload="auto"
        className={`fixed inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        >
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
        </video>
    );
}