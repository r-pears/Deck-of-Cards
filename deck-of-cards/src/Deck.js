import React, { useEffect, useState, useRef } from 'react';
import Card from "./Card";
import axios from 'axios';
import './Deck.css';

const BASE_URL = `http://deckofcardsapi.com/api/deck`;


/** Calls Deck API, draws a single card at a time */

const Deck = () => {
  const [deck, setDeck] = useState(null);
  const [drawn, setDrawn] = useState([]);
  const [autoDraw, setAutoDraw] = useState(false);
  const timerRef = useRef(null);


  /** When component mounts, load deck from API into state. */

  useEffect(() => {
    async function getData() {
      let resp = await axios.get(`${BASE_URL}/new/shuffle/`);
      setDeck(resp.data);
    }
    getData();
  }, [setDeck]);


  /** If autoDraw is true, draw a card each second. */

  useEffect(() => {
    /** Draw a card via API, add card to state "drawn" list */
    async function getCard() {
      let { deck_id } = deck;

      try {
        let drawResult = await axios.get(`${BASE_URL}/${deck_id}/draw/`);

        if (drawResult.data.remaining === 0) {
          setAutoDraw(false);
          throw new Error(`No cards left!`);
        }

        const card = drawResult.data.cards[0];

        setDrawn(d => [
          ...d,
          {
            id: card.code,
            name: card.suit + ' ' + card.value,
            image: card.image
          }
        ]);
      } catch (error) {
        console.log(`Error occured:` + error);
      }
    }

    if (autoDraw && !timerRef.current) {
      timerRef.current = setInterval(async () => {
        await getCard();
      }, 1000);
    }

    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [autoDraw, setAutoDraw, deck]);

  const toggleAutoDraw = () => {
    setAutoDraw(auto => !auto);
  };

  const cards = drawn.map(card => (
    <Card key={card.id} name={card.name} image={card.image} />
  ));

  return (
    <div className='Deck'>
      {deck && 
        <button className='Deck-draw-card' onClick={toggleAutoDraw}>Draw cards for me</button>
      }
      <div className='Deck-area'>{cards}</div>
    </div>
  );
}

export default Deck;
