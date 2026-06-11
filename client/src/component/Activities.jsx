import { useState } from "react";
import "./Activities.css";
import activityVideo from "../video/video oac1.mp4";
import activityVideoNext from "../video/video oac2.mp4";
import travelMemoriesVideo from "../video/vid oarc1.mp4";

const activityVideos = [activityVideo, activityVideoNext];

const activities = [
  {
    title: "Travel Memories",
    tag: "Featured reel",
    video: travelMemoriesVideo,
  },
  {
    title: "Travel Highlights",
    tag: "Featured reel",
    url: "https://www.instagram.com/reel/C_H35NZgmeP/",
  },
  {
    title: "Group Tours",
    tag: "Travel moments",
    url: "https://www.instagram.com/reel/DI3ilC3Ty8C/",
  },
  
  {
    title: "City Highlights",
    tag: "Package reels",
    url: "https://www.instagram.com/reel/DGn9sWnvy_t/",
  },
  {
    title: "Nature Trails",
    tag: "Outdoor reels",
    url: "https://www.instagram.com/reel/DGhrbJGzJLC/",
  },
];

function Activities() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeActivity = activities[activeIndex];
  const reelEmbedUrl = activeActivity.url ? `${activeActivity.url.split("?")[0]}embed` : "";

  const moveSlide = (direction) => {
    setActiveIndex((current) => {
      const next = current + direction;
      if (next < 0) return activities.length - 1;
      if (next >= activities.length) return 0;
      return next;
    });
  };

  return (
    <section className="activities" id="activities">
      <div className="activities__container">
        <div className="activities__header">
          
          <h2>Our Activities</h2>
          <span>Explore our handpicked travel moments, city views, group memories, and outdoor experiences.</span>
        </div>

        <div className="activities__content">
          <div className="activities__image-section">
            <button className="activities__control activities__control--left" type="button" onClick={() => moveSlide(-1)} aria-label="Previous activity">
              <i className="ri-arrow-left-s-line"></i>
            </button>

            <div className="activities__image-viewport">
              <video
                key={activeIndex}
                className="activities__feature-video"
                src={activityVideos[activeIndex % activityVideos.length]}
                controls
                playsInline
                preload="metadata"
              ></video>
              <div className="activities__image-overlay">
                <p>{activities[activeIndex].tag}</p>
                <h3>{activities[activeIndex].title}</h3>
              </div>
            </div>

            <button className="activities__control activities__control--right" type="button" onClick={() => moveSlide(1)} aria-label="Next activity">
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>

          <div className="activities__reel-section">
            <div className="activity-card__frame">
              {activeActivity.video ? (
                <video
                  key={activeActivity.video}
                  className="activity-card__video"
                  src={activeActivity.video}
                  controls
                  playsInline
                  preload="metadata"
                ></video>
              ) : (
                <iframe
                  key={activeActivity.url}
                  className="activity-card__embed"
                  src={reelEmbedUrl}
                  title={`${activeActivity.title} Instagram reel`}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              )}
            </div>
            <div className="activity-card__meta">
              <button className="activity-card__link" type="button" onClick={() => moveSlide(1)}>
                Next Reel
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="activities__dots" aria-label="Activity slider pagination">
          {activities.map((activity, index) => (
            <button
              key={activity.title}
              type="button"
              className={activeIndex === index ? "active" : ""}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show ${activity.title}`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Activities;
