import backgroundVideo from './chess_game_ai_2.mp4';

export default function VideoBackground({ isVisible }) {
    return (
        <div
        dangerouslySetInnerHTML={{
            __html: `
            <video
                autoplay
                playsinline
                loop
                muted
                preload="auto"
                class="fixed inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                isVisible ? 'opacity-100' : 'opacity-0'
                }"
            >
                <source src="${backgroundVideo}" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            `,
        }}
        ></div>
    );
}