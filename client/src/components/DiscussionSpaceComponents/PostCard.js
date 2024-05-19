import './PostCard.css';

function PostCard({ title, content, author, createdAt, authorPictureUrl }) {
    const handleImageError = (e) => {
        e.target.src = './default_profile_picture.jpg';
    };

    return (
        <article className="post-card">
            <section className="user-info">
                <img src='https://www.wilsoncenter.org/sites/default/files/media/images/person/james-person-1.jpg' /*{authorPictureUrl}*/ alt={`${author}'s profile pic`} className="author-picture" onError={handleImageError} />
                <div className="author-name">{author}</div>
            </section>
            <section className="post-info">
                <header className="post-header">
                    <div className="post-title">{title}</div>
                    <div className="post-timestamp">{createdAt}</div>
                </header>
                <div className="post-content">{content}</div>
                <div className="post-interactions">
                    <button className="reply-button">Reply</button>
                    <button className="flag-button">Flag Post</button>
                </div>
            </section>
        </article>
    );
}

export default PostCard;