import { Link } from "react-router-dom"
import gallery1 from "../image/gallery-1.jpg"
import gallery2 from  "../image/gallery-2.jpg"
import  gallery3 from "../image/gallery-3.jpg"
import  gallery4 from "../image/gallery-4.jpg"
import  gallery5 from "../image/gallery-5.jpg"

import  gallery21 from "../image/gallery-21.jpg"
import  gallery22 from "../image/gallery-22.jpg"
import  gallery23 from "../image/gallery-23.jpg"
import  gallery24 from "../image/gallery-24.jpg"
import  gallery25 from "../image/gallery-25.jpg"

import  gallery31 from "../image/gallery-31.jpg"
import  gallery32 from "../image/gallery-32.jpg"
import  gallery33 from "../image/gallery-33.jpg"
import  gallery34 from "../image/gallery-34.jpg"
import  gallery35 from "../image/gallery-35.jpg"
import domesticAjantaCaves from "../image/domestic-ajanta-caves.jpg"
import domesticCharminar from "../image/domestic-charminar.jpg"
import domesticDalLake from "../image/domestic-dal-lake.jpg"
import domesticGatewayIndia from "../image/domestic-gateway-india.jpg"
import domesticGoaBeaches from "../image/domestic-goa-beaches.jpg"
import domesticGoldenTemple from "../image/domestic-golden-temple.jpg"
import domesticHawaMahal from "../image/domestic-hawa-mahal.jpg"
import domesticIndiaGate from "../image/domestic-india-gate.jpg"
import domesticKonarkTemple from "../image/domestic-konark-temple.jpg"
import domesticMunnar from "../image/domestic-munnar.jpg"
import domesticMysorePalace from "../image/domestic-mysore-palace.jpg"
import domesticQutbMinar from "../image/domestic-qutb-minar.jpg"
import domesticRedFort from "../image/domestic-red-fort.jpg"
import domesticStatueUnity from "../image/domestic-statue-unity.jpg"
import domesticTajMahal from "../image/domestic-taj-mahal.jpg"

import "./Gallery.css"

const domesticRows = [
  [
    {
      title: "Taj Mahal",
      place: "Agra",
      img: domesticTajMahal,
    },
    {
      title: "Hawa Mahal",
      place: "Jaipur",
      img: domesticHawaMahal,
    },
    {
      title: "Golden Temple",
      place: "Amritsar",
      img: domesticGoldenTemple,
    },
    {
      title: "Gateway of India",
      place: "Mumbai",
      img: domesticGatewayIndia,
    },
    {
      title: "Mysore Palace",
      place: "Mysuru",
      img: domesticMysorePalace,
    },
  ],
  [
    {
      title: "Charminar",
      place: "Hyderabad",
      img: domesticCharminar,
    },
    {
      title: "Qutb Minar",
      place: "Delhi",
      img: domesticQutbMinar,
    },
    {
      title: "India Gate",
      place: "New Delhi",
      img: domesticIndiaGate,
    },
    {
      title: "Red Fort",
      place: "Delhi",
      img: domesticRedFort,
    },
    {
      title: "Statue of Unity",
      place: "Gujarat",
      img: domesticStatueUnity,
    },
  ],
  [
    {
      title: "Dal Lake",
      place: "Srinagar",
      img: domesticDalLake,
    },
    {
      title: "Munnar",
      place: "Kerala",
      img: domesticMunnar,
    },
    {
      title: "Goa Beaches",
      place: "Goa",
      img: domesticGoaBeaches,
    },
    {
      title: "Ajanta Caves",
      place: "Maharashtra",
      img: domesticAjantaCaves,
    },
    {
      title: "Konark Sun Temple",
      place: "Odisha",
      img: domesticKonarkTemple,
    },
  ],
];

function Gallery({ sectionId, title }) {
  const rowOne = [
    { title: "Northern Lights", place: "Norway", img: gallery1},
    { title: "Krabi", place: "Thailand", img: gallery2 },
    { title: "Bali", place: "Indonesia", img: gallery3 },
    { title: "Tokyo", place: "Japan", img: gallery4},
    { title: "Great Wall", place: "China", img: gallery5 }
  ];

  const rowTwo = [
    { title: "Heritage Sites", place: "Petra", img: gallery21 },
    { title: "Couple Boating", place: "Thailand", img:gallery22 },
    { title: "Eiffel Tower", place: "Paris", img: gallery23 },
    { title: "Pyramid", place: "Egypt", img: gallery24 },
    { title: " Village of Manarola ", place: "Italy", img: gallery25 }
  ];

  const rowThree = [
    { title: "Moreno Glacier", place: "Argentina", img: gallery31 },
    { title: "Krabi", place: "Thailand", img: gallery32 },
    { title: "Giant wheel", place: "London", img: gallery33 },
    { title: "Spirituality", place: "Asia", img: gallery34 },
    { title: "Petronas Tower", place: "Malaysia", img: gallery35 }
  ];
  const galleryRows = title === "Domestic Package" ? domesticRows : [rowOne, rowTwo, rowThree];
  const subheader = title === "Domestic Package"
    ? "Explore India's most beautiful tourist places."
    : "Explore the most beautiful places in the world.";

  return (
    <section className="gallery" id={sectionId}>
      <div className="gallery__container">
        <h2 className="section__header">Gallery photos</h2>
        <p className="section__subheader">{subheader}</p>
        <br />
        <h2>{title}</h2>

        {galleryRows.map((currentRow, rowIndex) => (
          <div key={rowIndex} className="gallery__grid" style={{ marginBottom: "20px" }}>
            {currentRow.map((item, itemIdx) => (
              <div key={itemIdx} className="gallery__card">
                <Link to="/londontour">
                  <img src={item.img} alt={`${item.title}, ${item.place}`} />
                </Link>
                <div className="gallery__content">
                  <h4>{item.title}</h4>
                  <p>{item.place}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export default Gallery
