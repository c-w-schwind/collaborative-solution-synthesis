import './MessageCard.css';

function MessageCard({ title, content, author, timestamp, authorPictureUrl }) {
    const handleImageError = (e) => {
        e.target.src = './default_profile_picture.jpg';
    };

    return (
        <article className="message-card">
            <section className="user-info">
                <img src={authorPictureUrl} alt={`${author}'s profile picture`} className="author-picture" onError={handleImageError} />
                <div className="author-name">{author}</div>
            </section>
            <section className="message-info">
                <header className="message-header">
                    <div className="message-title">{title}</div>
                    <div className="message-timestamp">{timestamp}</div>
                </header>
                <div className="message-content">{content}</div>
                <div className="message-interactions">
                    <button className="reply-button">Reply</button>
                    <button className="flag-button">Flag Post</button>
                </div>
            </section>
        </article>
    );
}

export default MessageCard;