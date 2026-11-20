import type { DesignContent, DesignsHub } from "@/lib/designs";
import { formatPrice, PRODUCTS } from "@/lib/products";

// English design pages - written for English searches (British spelling),
// not translated word for word from the German ones.

const themePrice = formatPrice(PRODUCTS.theme.priceCents, "en");
const eventPrice = formatPrice(PRODUCTS.paid_event.priceCents, "en");

export const DESIGNS_HUB_EN: DesignsHub = {
  title: "Designs for your online invitation",
  metaTitle: "Invitation designs for every occasion – GASTZILLA",
  description: `Free colour designs and premium designs for your online invitation: Halloween, kids' parties, weddings and more – premium ones ${themePrice} each.`,
  intro: `Colour designs are free in every event. Unlock a premium design on its own for ${themePrice} – or unlock a whole event for ${eventPrice} and get every design with it.`,
};

const UPDATED = "2026-11-20";

export const DESIGNS_EN: DesignContent[] = [
  {
    theme: "weiss",
    metaTitle: "White invitation design – free – GASTZILLA",
    metaDescription:
      "Plain white with a soft grey gradient and dark text: the free colour design for weddings, christenings, funerals and family gatherings.",
    title: "White – a simple, free design for your invitation",
    teaser: "Light, calm and timeless – free in every event.",
    description: [
      "A white background with a soft grey gradient, dark text and the GASTZILLA logo as a pale disc let your words take centre stage. It suits a wedding or christening, a funeral and a family gathering – and it is free in every event, including the first one.",
    ],
    updated: UPDATED,
  },
  {
    theme: "schwarz",
    metaTitle: "Black invitation design – free – GASTZILLA",
    metaDescription:
      "Deep black with light text: the free colour design for funerals, New Year’s Eve, Halloween and an elegant office party.",
    title: "Black – an elegant, free design for your invitation",
    teaser: "Dark and refined with light text – free in every event.",
    description: [
      "A background from charcoal to black, light text and the GASTZILLA logo as a dark disc look calm and elegant. It suits a funeral, New Year’s Eve, Halloween and an evening office party – free in every event.",
    ],
    updated: UPDATED,
  },
  {
    theme: "gruen",
    metaTitle: "Green invitation design – free – GASTZILLA",
    metaDescription:
      "Deep forest green with mint accents: the free colour design for barbecues, group sports, group trips and family gatherings outdoors.",
    title: "Green – a fresh, free design for your invitation",
    teaser: "Deep forest green with mint accents – free in every event.",
    description: [
      "A dark forest green, mint accents and the GASTZILLA logo as a green disc bring the outdoors to your invitation without any pictures. It suits a barbecue, a sports meet-up, a group trip and a family gathering in the open air – free in every event.",
    ],
    updated: UPDATED,
  },
  {
    theme: "blau",
    metaTitle: "Blue invitation design – free – GASTZILLA",
    metaDescription:
      "Midnight blue with light blue accents: the free colour design for Oktoberfest, group trips, cultural outings and rehearsals.",
    title: "Blue – a calm, free design for your invitation",
    teaser: "Midnight blue with light blue accents – free in every event.",
    description: [
      "A deep midnight blue, light blue accents and the GASTZILLA logo as a blue disc look clear and calm. It suits an Oktoberfest get-together, a group trip, a night at the theatre or a concert and a band or choir rehearsal – free in every event.",
    ],
    updated: UPDATED,
  },
  {
    theme: "rot",
    metaTitle: "Red invitation design – free – GASTZILLA",
    metaDescription:
      "Dark wine red with coral accents: the free colour design for Advent and Christmas parties, carnival, nights out and birthdays.",
    title: "Red – a bold, free design for your invitation",
    teaser: "Dark wine red with coral accents – free in every event.",
    description: [
      "A dark wine red, coral accents and the GASTZILLA logo as a red disc give your invitation warmth and punch. It suits a Christmas party in Advent, a carnival party, a night out and a birthday – free in every event.",
    ],
    updated: UPDATED,
  },
  {
    theme: "pink",
    metaTitle: "Pink invitation design – free – GASTZILLA",
    metaDescription:
      "Blush to hot pink with dark text: the free colour design for baby showers, hen dos, kids’ parties and birthdays.",
    title: "Pink – a cheerful, free design for your invitation",
    teaser: "From blush to hot pink – free in every event.",
    description: [
      "A gradient from blush to hot pink, dark berry text and the GASTZILLA logo as a pink disc make your invitation cheerful and playful. It suits a baby shower, a hen do, a kids’ party and a birthday – free in every event.",
    ],
    updated: UPDATED,
  },
  {
    theme: "orange",
    metaTitle: "Orange invitation design – free – GASTZILLA",
    metaDescription:
      "Bright orange to rust with light text: the free colour design for Halloween, barbecues, school fairs and playdates.",
    title: "Orange – a bright, free design for your invitation",
    teaser: "Bright orange to rust – free in every event.",
    description: [
      "A gradient from bright orange to rust, light text and the GASTZILLA logo as an orange disc feel as warm as an autumn evening. It suits a Halloween party, a barbecue, a nursery or school fair and a playdate – free in every event.",
    ],
    updated: UPDATED,
  },
  {
    theme: "gelb",
    metaTitle: "Yellow invitation design – free – GASTZILLA",
    metaDescription:
      "Sunny yellow to gold with dark brown text: the free colour design for kids’ parties, the first day of school, playdates and barbecues.",
    title: "Yellow – a sunny, free design for your invitation",
    teaser: "Sunny yellow to gold – free in every event.",
    description: [
      "A gradient from sunny yellow to gold, dark brown text and the GASTZILLA logo as a yellow disc put everyone in a good mood. It suits a kids’ party, the first day of school, a playdate and a summer barbecue – free in every event.",
    ],
    updated: UPDATED,
  },
  {
    theme: "ballons",
    metaTitle: "Balloon invitation design – GASTZILLA",
    metaDescription:
      "An online invitation framed by gold, black and white balloon garlands – stylish for milestone birthdays, New Year’s Eve and office parties.",
    title: "Balloons – an elegant design for your birthday invitation",
    teaser: "Balloon garlands in gold, black and white – festive, not childish.",
    description: [
      "A gold balloon dog, garlands of gold, black and white balloons and two floating balloons frame your invitation. The look is festive and grown-up – right for a 30th, 40th or 50th birthday, New Year’s Eve or the office party.",
    ],
    updated: UPDATED,
  },
  {
    theme: "foam",
    metaTitle: "Foam party invitation design – GASTZILLA",
    metaDescription:
      "A rubber duck, white foam and soap bubbles: the foam party design for kids’ birthdays, pool parties and theme parties. Guests reply via one link.",
    title: "Foam Party – a bubbly design for your party invitation",
    teaser: "Rubber duck, foam clouds and soap bubbles on light aqua.",
    description: [
      "A yellow rubber duck in the suds, white foam clouds at the sides and floating soap bubbles turn your invitation into bath time. Ideal for a foam party, a kids’ birthday with water games or any theme party that should feel light and playful.",
    ],
    updated: UPDATED,
  },
  {
    theme: "halloweenclay",
    metaTitle: "Halloween invitation in a clay look – GASTZILLA",
    metaDescription:
      "A grinning pumpkin, mint-green ghosts and twisted trees that look like modelling clay: a fun, not-too-scary Halloween invitation design.",
    title: "Halloween Clay – a fun design for your Halloween invitation",
    teaser: "Halloween in clay: a grinning pumpkin, mint ghosts and crooked spooky trees.",
    description: [
      "A carved pumpkin, mint-green ghosts and crooked trees on a purple hill all look as if they were shaped from modelling clay. Spooky enough for Halloween but friendly – good for kids’ parties and for adults who prefer funny to gory.",
    ],
    updated: UPDATED,
  },
  {
    theme: "halloweengraveyard",
    metaTitle: "Halloween graveyard invitation design – GASTZILLA",
    metaDescription:
      "A glowing pumpkin, crumbling ruins, a lantern and bats: the dark graveyard design for your Halloween party invitation for adults.",
    title: "Halloween Graveyard – a dark design for your Halloween invitation",
    teaser: "Dark and moody: a glowing pumpkin, old ruins and bats.",
    description: [
      "A pumpkin with glowing eyes, a crumbling graveyard ruin, bare trees with a lantern and two bats give your invitation a proper chill. Made for a grown-up Halloween party and any theme party that is allowed to get truly creepy.",
    ],
    updated: UPDATED,
  },
  {
    theme: "halloweenkids",
    metaTitle: "Halloween invitation design for kids – GASTZILLA",
    metaDescription:
      "Cute watercolour ghosts with a witch’s hat and lantern, a pumpkin and a witch’s house: the design for a children’s Halloween party invitation.",
    title: "Halloween Kids – a cute design for a children’s Halloween party",
    teaser: "Friendly ghosts in a witch’s hat, a moonlit pumpkin and a witch’s house – in watercolour.",
    description: [
      "Two friendly ghosts with a witch’s hat and a lantern, a pumpkin under the full moon and a witch’s house full of pumpkins are painted in soft watercolours. Nothing here is frightening – ideal for Halloween at nursery, a kids’ Halloween party or a birthday at the end of October.",
    ],
    updated: UPDATED,
  },
  {
    theme: "christmaskids",
    metaTitle: "Kids’ Christmas invitation with angels – GASTZILLA",
    metaDescription:
      "The Star of Bethlehem, a nativity in the snow and little angels in watercolour: the design for nativity plays, school Christmas parties and Advent.",
    title: "Christmas Kids – a design with the nativity and angels",
    teaser: "The Star of Bethlehem, a nativity in the snow and little angels in watercolour.",
    description: [
      "The Star of Bethlehem above the stable, a snowy village with a nativity scene and two little angels singing and playing the trumpet tell the Christmas story. The design suits a nativity play, the Christmas party at nursery or school and an Advent afternoon with the family.",
    ],
    updated: UPDATED,
  },
  {
    theme: "christmassnow",
    metaTitle: "Snowy Christmas invitation design – GASTZILLA",
    metaDescription:
      "A snow globe, snowy houses, a Christmas tree and snowflakes: the wintry design for office Christmas parties, mulled wine evenings and Advent.",
    title: "Christmas Snow – a wintry design for your Christmas invitation",
    teaser: "A snow globe, a snowy village and a decorated Christmas tree.",
    description: [
      "A snow globe with tiny houses, a village under snow, a decorated Christmas tree and big snowflakes bring winter to your invitation. Lovely for the office Christmas party, a mulled wine evening with friends or a family gathering in Advent.",
    ],
    updated: UPDATED,
  },
  {
    theme: "artdeco",
    metaTitle: "1920s Art Deco invitation design – GASTZILLA",
    metaDescription:
      "Black, gold and emerald in 1920s style: a peacock feather, a shell fan and a champagne coupe. For Gatsby parties, New Year’s Eve and weddings.",
    title: "Art Deco – a design for your 1920s party invitation",
    teaser: "Gold lines, a peacock feather and a champagne coupe in Roaring Twenties style.",
    description: [
      "Gold lines on black, a shell fan, a peacock feather and an emerald champagne coupe bring the Roaring Twenties to your invitation. The design suits a Gatsby or 1920s theme party, New Year’s Eve, a milestone birthday and an elegant wedding.",
    ],
    updated: UPDATED,
  },
  {
    theme: "disco",
    metaTitle: "Retro disco party invitation design – GASTZILLA",
    metaDescription:
      "A mirror ball, a cassette, neon sunglasses and roller skates: the colourful retro design for your 80s or 90s party, birthday or graduation.",
    title: "Disco – a neon design for your 80s and 90s party invitation",
    teaser: "Mirror ball, cassette and neon sunglasses – retro in pink and turquoise.",
    description: [
      "A glittering mirror ball, stacks of roller skates, boomboxes and palm trees in neon colours, plus a cassette and bright sunglasses: this design is a trip back to the 80s and 90s. Ideal for a theme party, a birthday with a dance floor or a graduation party.",
    ],
    updated: UPDATED,
  },
  {
    theme: "hippie",
    metaTitle: "Hippie party invitation in 70s style – GASTZILLA",
    metaDescription:
      "A peace sign made of flowers, a camper van, a guitar and a butterfly in warm 70s colours: the design for hippie parties and flower-power birthdays.",
    title: "Hippie – a flower-power design for your theme party invitation",
    teaser: "A peace sign, flowers and a butterfly in warm seventies colours.",
    description: [
      "A peace sign made of flowers, swirling patterns with a camper van and a guitar, a retro flower and a colourful butterfly bring flower power in warm orange and green. It suits a hippie or 70s party, a birthday in the garden and a laid-back summer barbecue.",
    ],
    updated: UPDATED,
  },
  {
    theme: "newyear",
    metaTitle: "New Year’s Eve invitation with fireworks – GASTZILLA",
    metaDescription:
      "Gold fireworks, champagne on ice and popping corks: the design for your New Year’s Eve party invitation. Guests reply via one link.",
    title: "New Year – a fireworks design for your New Year’s Eve invitation",
    teaser: "Gold fireworks on black, champagne on ice and popping corks.",
    description: [
      "Gold fireworks on a black background, champagne bottles on ice in a shower of sparks and two popping corks are already counting down. Made for a New Year’s Eve party, it also fits New Year drinks with colleagues or a night out with friends.",
    ],
    updated: UPDATED,
  },
  {
    theme: "birthdaypresents",
    metaTitle: "Birthday invitation with cake and presents – GASTZILLA",
    metaDescription:
      "A colourful cake with candles, piles of presents and streamers: the cheerful design for your birthday invitation – for kids and adults.",
    title: "Birthday Presents – a colourful design for your birthday invitation",
    teaser: "A colourful cake with candles, piles of presents and streamers.",
    description: [
      "A colourful cake with lit candles and strawberries, tall stacks of wrapped presents and streamers with a gold star say at once: it is somebody’s birthday. The design suits a kids’ party as well as a birthday celebration with the whole family.",
    ],
    updated: UPDATED,
  },
  {
    theme: "birthdayprincess",
    metaTitle: "Princess invitation for a kids’ party – GASTZILLA",
    metaDescription:
      "A pink cake, balloons, presents in pink and lilac and a gold crown: the princess design for your child’s birthday party invitation.",
    title: "Birthday Princess – a design for a princess birthday invitation",
    teaser: "A pink cake, presents in pink and lilac and a golden crown.",
    description: [
      "A pink cake with balloons, stacks of presents in pink and lilac and streamers with a gold crown and heart make your invitation royal. Ideal for a princess birthday, a dressing-up theme party or a playdate in costume.",
    ],
    updated: UPDATED,
  },
  {
    theme: "penandpaper",
    metaTitle: "Pen & paper RPG night invitation – GASTZILLA",
    metaDescription:
      "A glowing spellbook, castle ruins, a dragon and red d20 dice: the fantasy design for your tabletop RPG session or game night.",
    title: "Pen & Paper – a fantasy design for your RPG night invitation",
    teaser: "A spellbook, castle ruins, a dragon and red d20 dice.",
    description: [
      "An open, glowing spellbook, a ruined castle, a dragon on a crag and two red d20 dice call the party to the next session. Made for tabletop role-playing groups, it fits any game night with fantasy fans.",
    ],
    updated: UPDATED,
  },
  {
    theme: "magic",
    metaTitle: "Wizard party invitation design – GASTZILLA",
    metaDescription:
      "A bubbling cauldron, a wizard castle with an owl and flying broomsticks: the design for a wizard-themed kids’ birthday or magical theme party.",
    title: "Magic – a design for your wizard party invitation",
    teaser: "A bubbling cauldron, a castle with an owl and flying broomsticks.",
    description: [
      "A cauldron of bubbling green potion, a castle at dusk, a white owl and two flying broomsticks invite your guests to wizard school. Perfect for a wizard-themed kids’ birthday, a magical theme party or a fantasy game night.",
    ],
    updated: UPDATED,
  },
  {
    theme: "pirates",
    metaTitle: "Pirate party invitation design – GASTZILLA",
    metaDescription:
      "A skull with an eye patch, a pirate ship, a treasure island and parrots: the adventurous design for pirate parties, birthdays and stag dos.",
    title: "Pirates – an adventurous design for your pirate party invitation",
    teaser: "A skull with an eye patch, a pirate ship and colourful parrots.",
    description: [
      "A skull with an eye patch and a snake, a rock in the jungle, a pirate ship off the island and two colourful parrots set sail. This realistic design suits a pirate theme party for teens and adults, a birthday and a stag or hen do.",
    ],
    updated: UPDATED,
  },
  {
    theme: "pirateskids",
    metaTitle: "Pirate invitation for a kids’ party – GASTZILLA",
    metaDescription:
      "A pirate hat, a treasure island, a spyglass and a message in a bottle in watercolour: the friendly pirate design for a kids’ birthday invitation.",
    title: "Pirates Kids – a design for a pirate kids’ birthday party",
    teaser: "A pirate hat, a treasure island, a spyglass and a message in a bottle – in watercolour.",
    description: [
      "A pirate hat with a skull, a treasure island with palm trees, a pirate ship, a spyglass and a message in a bottle are painted in soft watercolours. The design gets everyone ready for a treasure hunt – ideal for a pirate kids’ party or an adventurous playdate.",
    ],
    updated: UPDATED,
  },
  {
    theme: "teddy",
    metaTitle: "Teddy bear invitation design – GASTZILLA",
    metaDescription:
      "A teddy with a bow, cuddly toys and star and moon cushions: the gentle design for baby showers, christenings and a first birthday party.",
    title: "Teddy – a cosy design for baby showers and kids’ parties",
    teaser: "A teddy with a bow, piles of cuddly toys, star and moon cushions.",
    description: [
      "A teddy bear with a pale blue bow, piles of cuddly toys and two cushions shaped like a star and a moon look soft and calm. The design suits a baby shower, a christening, a first birthday and a playdate for the little ones.",
    ],
    updated: UPDATED,
  },
  {
    theme: "cinema",
    metaTitle: "Movie night invitation in a cinema design – GASTZILLA",
    metaDescription:
      "A film reel, a projector, red cinema seats and popcorn: the cinema design for movie nights, trips to the cinema, birthdays and Oscars parties.",
    title: "Cinema – a design for your movie night invitation",
    teaser: "A film reel, a projector, red cinema seats and popcorn.",
    description: [
      "A film reel, an old projector with film strips, red cinema seats and popcorn bring the feel of the pictures to your invitation. Ideal for a movie night at home, a trip to the cinema together, a birthday with a film or an Oscars theme party.",
    ],
    updated: UPDATED,
  },
  {
    theme: "tarot",
    metaTitle: "Tarot invitation design with a crystal ball – GASTZILLA",
    metaDescription:
      "A crystal ball, a fortune teller’s table with candles and tarot cards in midnight blue and gold: the mystical design for theme parties and Halloween.",
    title: "Tarot – a mystical design for your theme party invitation",
    teaser: "A crystal ball, candles on velvet and tarot cards in midnight blue and gold.",
    description: [
      "A crystal ball swirling with violet mist, a fortune teller’s table with candles and velvet and two tarot cards with a gold sun and moon create an air of mystery. The design suits a fortune teller theme party, Halloween and a hen do.",
    ],
    updated: UPDATED,
  },
  {
    theme: "karnaval",
    metaTitle: "Carnival party invitation design – GASTZILLA",
    metaDescription:
      "A jester’s hat, a colourful carnival parade, streamers and sweets: the design for carnival and fancy dress parties at home, nursery or school.",
    title: "Carnival – a colourful design for your carnival party invitation",
    teaser: "A jester’s hat, a colourful parade, streamers and sweets.",
    description: [
      "A jester’s hat in blue, yellow and green, a parade full of costumes, streamers, sweets and confetti bring carnival season to your invitation. The design suits a carnival or fancy dress party and carnival celebrations at nursery or school.",
    ],
    updated: UPDATED,
  },
  {
    theme: "pride",
    metaTitle: "Rainbow invitation design for Pride – GASTZILLA",
    metaDescription:
      "A rainbow button, waving rainbow flags and hearts: the Pride design for Pride parties, meet-ups before the parade and colourful birthdays.",
    title: "Pride – a rainbow design for your party invitation",
    teaser: "A rainbow button, waving flags and rainbow hearts.",
    description: [
      "A round rainbow button, waving rainbow flags and two glossy rainbow hearts make your invitation loud and colourful. Ideal for a Pride party, meeting up before the parade, a night out or a birthday in every colour.",
    ],
    updated: UPDATED,
  },
  {
    theme: "dinosaurier",
    metaTitle: "Dinosaur invitation for a kids’ party – GASTZILLA",
    metaDescription:
      "A dinosaur footprint in stone, a T. rex in the jungle, long-necks by a volcano and pterosaurs: the dinosaur design for a kids’ birthday party.",
    title: "Dinosaurs – a design for your dinosaur birthday invitation",
    teaser: "A dinosaur footprint, a T. rex in the jungle and pterosaurs.",
    description: [
      "A fossil footprint, a T. rex in the jungle, long-necked dinosaurs in front of a volcano and two pterosaurs make your invitation a trip back in time. Made for dinosaur fans – ideal for a kids’ birthday or a playdate with a fossil dig.",
    ],
    updated: UPDATED,
  },
  {
    theme: "weltall",
    metaTitle: "Space party invitation for kids – GASTZILLA",
    metaDescription:
      "A space shuttle, a rocket launch, the moon and floating astronauts in watercolour: the space design for kids’ birthdays and theme parties.",
    title: "Space – a design for your space party invitation",
    teaser: "A space shuttle, a rocket launch, the moon and floating astronauts.",
    description: [
      "A space shuttle against a galaxy, a rocket launch, the moon and two floating astronauts are painted in watercolour. The design invites guests to a space-themed kids’ birthday and fits an astronaut theme party or a school fair with a stars theme.",
    ],
    updated: UPDATED,
  },
  {
    theme: "einschulung",
    metaTitle: "First day of school party invitation – GASTZILLA",
    metaDescription:
      "A school cone with a bow, woodland animals with school things and birds in watercolour: the design for a first day of school celebration.",
    title: "First Day of School – a design for the start of school celebration",
    teaser: "A school cone with a bow, woodland animals with school things and birds.",
    description: [
      "A pastel school cone with a big bow, woodland animals with books and pencils and two little birds are painted in watercolour. The design suits a celebration after the first day of school, a school fair and a family get-together around the big day.",
    ],
    updated: UPDATED,
  },
  {
    theme: "ninja",
    metaTitle: "Ninja invitation for a kids’ party – GASTZILLA",
    metaDescription:
      "Yin and yang, pagodas under cherry blossom and throwing stars: the ninja design for a kids’ birthday, a playdate or a martial arts meet-up.",
    title: "Ninja – a design for your ninja birthday party invitation",
    teaser: "Yin and yang, pagodas under cherry blossom and throwing stars.",
    description: [
      "A yin and yang symbol, Japanese pagodas under cherry blossom and two throwing stars give your invitation ninja suspense. Ideal for a ninja kids’ party with an obstacle course, a playdate or a get-together after martial arts training.",
    ],
    updated: UPDATED,
  },
  {
    theme: "fussball",
    metaTitle: "Football party invitation design – GASTZILLA",
    metaDescription:
      "A football, players and a keeper, a trophy and boots: the design for a football birthday party, a team celebration or watching the match.",
    title: "Football – a design for your football birthday invitation",
    teaser: "A football, players, a trophy and boots mid-kick.",
    description: [
      "A football, players in a tackle, a keeper in mid-air, a gold trophy and two boots striking the ball bring stadium atmosphere to your invitation. The design suits a football kids’ party, a team celebration, a kickabout in the park or watching the match over a barbecue.",
    ],
    updated: UPDATED,
  },
  {
    theme: "toycars",
    metaTitle: "Toy car invitation for a kids’ party – GASTZILLA",
    metaDescription:
      "A red racing car in flames, colourful race tracks with loops and blazing tyres: the design for a racing car kids’ birthday party.",
    title: "Toy Cars – a design for your racing car birthday invitation",
    teaser: "A racing car in flames, race tracks with loops and blazing tyres.",
    description: [
      "A red racing car in flames, colourful race tracks with loops and toy cars and two tyres trailing fire bring speed to your invitation. Made for little racers – ideal for a kids’ party with car races or a playdate.",
    ],
    updated: UPDATED,
  },
  {
    theme: "hochzeit",
    metaTitle: "Wedding invitation with doves – GASTZILLA",
    metaDescription:
      "A bride and groom cake topper, peonies, floral arrangements and white doves: the romantic design for weddings, hen and stag dos.",
    title: "Wedding – a romantic design for your wedding invitation",
    teaser: "A bride and groom cake topper, peonies and white doves.",
    description: [
      "A bride and groom cake topper among peonies, lavish floral arrangements in white and blush and two white doves give your invitation a romantic frame. The design suits a wedding, a hen or stag do and the family celebration afterwards.",
    ],
    updated: UPDATED,
  },
  {
    theme: "brettspiele",
    metaTitle: "Board game night invitation design – GASTZILLA",
    metaDescription:
      "Red and blue game pieces, towers of board games and dice: the design for game nights, regular board game meet-ups and family games afternoons.",
    title: "Board Games – a design for your game night invitation",
    teaser: "Game pieces, towers of game boxes and big dice.",
    description: [
      "Two game pieces in red and blue on a board, towers of game boxes and boards and two big dice make it clear what the evening is about. Ideal for a game night with friends, a regular board game group and a games afternoon with the family.",
    ],
    updated: UPDATED,
  },
  {
    theme: "bowling",
    metaTitle: "Bowling night invitation design – GASTZILLA",
    metaDescription:
      "A black bowling ball, the ball return, a lane and pins: the design for bowling nights, team events, club outings and kids’ bowling parties.",
    title: "Bowling – a design for your bowling night invitation",
    teaser: "A bowling ball, the ball return, a lane and pins.",
    description: [
      "A shiny black bowling ball, the ball return, a lane with a rolling ball and two pins with red stripes make everyone want the next strike. The design suits a bowling night with friends, a team event, a club outing and a kids’ party at the bowling alley.",
    ],
    updated: UPDATED,
  },
  {
    theme: "hawaii",
    metaTitle: "Hawaiian party invitation design – GASTZILLA",
    metaDescription:
      "A coconut cocktail, a beach with palms and hula dancers, frangipani and hibiscus: the design for luau parties, summer parties and barbecues.",
    title: "Hawaii – a summery design for your Hawaiian party invitation",
    teaser: "A coconut cocktail, a beach with palms, frangipani and hibiscus.",
    description: [
      "A cocktail in a coconut with pineapple and a paper umbrella, a beach with palm trees and hula dancers, a frangipani and a red hibiscus bring holiday feelings to your invitation. Ideal for a luau or beach party, a summer party in the garden and a barbecue.",
    ],
    updated: UPDATED,
  },
  {
    theme: "gaming",
    metaTitle: "Gaming night invitation design – GASTZILLA",
    metaDescription:
      "A joystick, an arcade cabinet and controllers in neon light: the design for gaming nights, gamers’ birthdays and retro theme parties.",
    title: "Gaming – a design for your gaming night invitation",
    teaser: "A joystick, an arcade cabinet, controllers and a beanbag in neon light.",
    description: [
      "A joystick with a red ball, an arcade cabinet with neon stripes, two controllers and a gamer on a beanbag with crisps and cola put your invitation in the glow of a games room at night. The design suits a gaming night with friends, a gamer’s birthday, a kids’ party around the console and a retro theme party.",
    ],
    updated: UPDATED,
  },
  {
    theme: "kerzenweiss",
    metaTitle: "Funeral invitation: flowers and candles, white – GASTZILLA",
    metaDescription:
      "A wreath of white roses, lanterns with candles, lilies and calla lilies: the light design for a funeral or memorial service invitation.",
    title: "Flowers and candles (white) – a light design for a funeral invitation",
    teaser: "White roses, lilies, calla lilies and lanterns with candles in soft watercolour.",
    description: [
      "A wreath of white roses with a ribbon, lanterns with lit candles, lilies, calla lilies and eucalyptus in soft watercolours give the invitation a calm, dignified setting. The light design suits an invitation to a funeral or memorial service, a burial and the gathering afterwards.",
    ],
    updated: UPDATED,
  },
  {
    theme: "kerzenschwarz",
    metaTitle: "Funeral invitation: flowers and candles, black – GASTZILLA",
    metaDescription:
      "A black rose, dark petals and burning candles: the dark design for a funeral or memorial service invitation.",
    title: "Flowers and candles (black) – a dark design for a funeral invitation",
    teaser: "A black rose, dark petals and tall burning candles.",
    description: [
      "A black rose with falling petals and tall burning candles against deep darkness give the invitation a quiet, solemn setting. The dark design suits an invitation to a funeral, a burial and a memorial service.",
    ],
    updated: UPDATED,
  },
  {
    theme: "natur",
    metaTitle: "Nature invitation design with mushrooms – GASTZILLA",
    metaDescription:
      "Mushrooms in moss, ferns, a bee and a butterfly in watercolour: the nature design for garden parties, barbecues, weddings and family gatherings.",
    title: "Nature – a design for your garden party invitation",
    teaser: "Mushrooms in moss, ferns and greenery, a bee and a butterfly.",
    description: [
      "Two mushrooms among ferns and moss, a frame of leaves, a bee and a butterfly are painted in fine watercolour. The design suits a garden party, a barbecue, a wedding outdoors and a family gathering in the open air.",
    ],
    updated: UPDATED,
  },
];
