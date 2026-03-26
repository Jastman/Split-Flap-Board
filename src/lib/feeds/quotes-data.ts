export interface Quote {
  text: string;
  author: string;
  category: 'optimism' | 'meaning' | 'parenting' | 'universe';
}

export const QUOTES: Quote[] = [
  // Optimism
  { text: 'OPTIMISM IS THE FAITH THAT LEADS TO ACHIEVEMENT', author: 'HELEN KELLER', category: 'optimism' },
  { text: 'THE BEST IS YET TO COME', author: 'FRANK SINATRA', category: 'optimism' },
  { text: 'THERE IS SOMETHING GOOD IN EVERY DAY', author: 'UNKNOWN', category: 'optimism' },
  { text: 'KEEP YOUR FACE ALWAYS TOWARD THE SUNSHINE', author: 'WALT WHITMAN', category: 'optimism' },
  { text: 'WHAT YOU BECOME BY ACHIEVING YOUR GOALS IS MORE IMPORTANT THAN WHAT YOU GET', author: 'ZIG ZIGLAR', category: 'optimism' },
  { text: 'IN THE MIDDLE OF EVERY DIFFICULTY LIES OPPORTUNITY', author: 'ALBERT EINSTEIN', category: 'optimism' },

  // Meaning
  { text: 'WE ARE A WAY FOR THE COSMOS TO KNOW ITSELF', author: 'CARL SAGAN', category: 'universe' },
  { text: 'THE MEANING OF LIFE IS TO FIND YOUR GIFT. THE PURPOSE IS TO GIVE IT AWAY', author: 'PABLO PICASSO', category: 'meaning' },
  { text: 'TO LIVE IS THE RAREST THING. MOST PEOPLE EXIST THAT IS ALL', author: 'OSCAR WILDE', category: 'meaning' },
  { text: 'HAPPINESS COMES FROM YOUR OWN ACTIONS', author: 'DALAI LAMA', category: 'meaning' },
  { text: 'THE PURPOSE OF OUR LIVES IS TO BE HAPPY', author: 'DALAI LAMA', category: 'meaning' },

  // Parenting
  { text: 'CHILDREN ARE NOT THINGS TO BE MOLDED BUT PEOPLE TO BE UNFOLDED', author: 'JESS LAIR', category: 'parenting' },
  { text: 'THE MOST IMPORTANT THING IN THE WORLD IS FAMILY AND LOVE', author: 'JOHN WOODEN', category: 'parenting' },
  { text: 'PARENTING IS THE ART OF LETTING GO WHILE STILL HOLDING ON', author: 'UNKNOWN', category: 'parenting' },
  { text: 'YOUR CHILDREN ARE THE GREATEST GIFT LIFE CAN GIVE YOU', author: 'UNKNOWN', category: 'parenting' },
  { text: 'RAISE YOUR CHILDREN WITH LOVE AND RESPECT', author: 'UNKNOWN', category: 'parenting' },

  // Universe
  { text: 'LOOK UP AT THE STARS AND NOT DOWN AT YOUR FEET', author: 'STEPHEN HAWKING', category: 'universe' },
  { text: 'THE UNIVERSE IS QUEERER THAN WE CAN SUPPOSE', author: 'J.B.S. HALDANE', category: 'universe' },
  { text: 'PALE BLUE DOT. A MOTE OF DUST SUSPENDED IN A SUNBEAM', author: 'CARL SAGAN', category: 'universe' },
  { text: 'WE ARE ALL CONNECTED IN THE GREAT CIRCLE OF LIFE', author: 'CARL SAGAN', category: 'universe' },
  { text: 'SOMEWHERE SOMETHING INCREDIBLE IS WAITING TO BE KNOWN', author: 'SHARON BEGLEY', category: 'universe' },
];
