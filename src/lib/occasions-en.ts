import type { OccasionContent, OccasionsHub } from "@/lib/occasions";

// English occasion pages (/en/invitations/<slug>) - same ids and order as
// the German list in occasions.ts, slugs in occasion-slugs.ts. Written for
// English searches (British spelling), not translated word for word: FAQ
// questions come from real English search suggestions. Same rules as in
// German: only claim what GASTZILLA really does.

export const OCCASIONS_HUB_EN: OccasionsHub = {
  title: "Online invitations for every occasion",
  metaTitle: "Online Invitations for Every Occasion – GASTZILLA",
  description:
    "Kids' party, wedding or BBQ: create a free online invitation, share the link and collect every RSVP in one guest list – guests need no app or account.",
  intro:
    "Whatever you're celebrating, GASTZILLA gives every occasion its own invitation page in a matching design. Your guests reply yes or no via the link – no account, no app and no RSVP chaos in the group chat. If the date isn't fixed yet, they simply vote on it first.",
};

const UPDATED = "2026-11-14";

export const OCCASIONS_EN: OccasionContent[] = [
  {
    id: "kids-birthday",
    name: "Kids' birthday party",
    title: "Create a kids' birthday party invitation online",
    metaTitle: "Kids' Birthday Party Invitations Online – GASTZILLA",
    description:
      "Kids' birthday party invitation by link: parents RSVP without an account, and you see drop-off and pick-up times and who brings what. Free & ad-free.",
    teaser: "Parents RSVP via the link – with drop-off and pick-up times, siblings and snacks.",
    intro: [
      "At a kids' birthday party the replies usually come from everywhere: a few in the class group chat, a few by text, one at the school gate. So who's actually coming, who's bringing a little brother, and when is everyone being picked up?",
      "With GASTZILLA you create an invitation page for the party in a few minutes and send the link to the parents. They add their child themselves – no account or app needed – and you have every reply in one list.",
    ],
    benefitsTitle: "Why GASTZILLA works for a kids' birthday party",
    benefits: [
      {
        title: "Drop-off and pick-up at a glance",
        text: "Parents can say when they'll drop their child off and pick them up again. You know who's there when – and nobody waits at the door for nothing.",
      },
      {
        title: "Siblings and grown-ups too",
        text: "Is a parent or a sibling coming along? Companions are added by name right in the reply and counted.",
      },
      {
        title: "Cake, cupcakes and juice sorted",
        text: "Whoever brings cake, cupcakes or juice notes it down. Everyone can see it – so you don't end up with five pasta salads.",
      },
      {
        title: "One link for the class chat",
        text: "Share the invitation via WhatsApp, Signal, Telegram or email. You get an email for every yes or no.",
      },
    ],
    invitationText: [
      "Dear parents,",
      "[Child's name] is turning [age] and would love to celebrate with [your child]! 🎈",
      "When: [date], [start time] to [end time]",
      "Where: [place]",
      "Please add your child via this link by [date] – you can also note drop-off and pick-up times and anything you're bringing: [Link]",
      "We're looking forward to it!",
      "[Your name]",
    ],
    faq: [
      {
        question: "When should you send kids' birthday party invitations?",
        answer:
          "Two to three weeks before the party is usual. That gives parents time to plan the date and a present.",
      },
      {
        question: "How long should a kids' birthday party last?",
        answer:
          "Two to three hours is usually enough for younger children; older kids can manage three to four. With GASTZILLA parents enter drop-off and pick-up times themselves – so the end is clear to everyone.",
      },
      {
        question: "How many children should you invite to a birthday party?",
        answer:
          "A popular rule of thumb: as many children as the age the birthday child is turning. GASTZILLA shows you at any time how many have said yes – siblings and companions included.",
      },
      {
        question: "Can other parents see who's coming to the party?",
        answer:
          "Yes – everyone with the invitation link, so the families you invited. Search engines can't find your event page. Only share the link with the parents you want to invite – or protect the page with a password as well.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "kids-playdate",
    name: "Playdate",
    title: "Organise a group playdate for kids by link",
    metaTitle: "Organise a Group Playdate for Kids – GASTZILLA",
    description:
      "Planning a playdate for several kids: parents RSVP via a link without an account and say when they'll drop off and pick up. Free & ad-free.",
    teaser: "Several kids, one afternoon – parents add drop-off and pick-up times themselves.",
    intro: [
      "When several children meet up to play – after nursery, at the playground or at your place – the arrangements usually run through lots of separate parent chats: who's coming, when's drop-off, who's picking up when, and can the little sibling come too?",
      "With GASTZILLA you create a page for the playdate in a few minutes and send the link to the parents. They add their child themselves – no account or app needed – and everyone knows who's coming.",
    ],
    benefitsTitle: "Why GASTZILLA works for a playdate",
    benefits: [
      {
        title: "Drop-off and pick-up sorted",
        text: "Parents say when they'll bring their child and can add how long they'll stay. You always know which children are there.",
      },
      {
        title: "Add siblings too",
        text: "Is the little brother or a parent coming along? Companions are added by name in the reply and counted.",
      },
      {
        title: "The important bits included",
        text: "Parents can leave a message – about allergies, say, or who's picking up today.",
      },
      {
        title: "Snacks without doubles",
        text: "Whoever brings fruit, muffins or drinks notes it down. Everyone sees it, and nothing turns up twice.",
      },
    ],
    invitationText: [
      "Hi everyone,",
      "the kids want to get together to play again! 🧸",
      "When: [date], from [time]",
      "Where: [place]",
      "Please add your child here and let us know when you'll drop off and pick up: [Link]",
      "See you soon,",
      "[Your name]",
    ],
    faq: [
      {
        question: "How long should a playdate last?",
        answer:
          "Two to three hours is often plenty for younger children. With GASTZILLA parents enter drop-off and pick-up times themselves – so everyone knows when it ends.",
      },
      {
        question: "Do parents stay for a playdate?",
        answer:
          "With toddlers and younger children a parent often stays; older kids are usually dropped off. Parents can say in their reply whether they're staying – a parent who stays is simply added as a companion.",
      },
      {
        question: "How do I find out about allergies?",
        answer:
          "Parents can leave a message with their reply, for example about allergies or who's picking up. The message appears right next to their entry in the list.",
      },
      {
        question: "Who can see which children are coming?",
        answer:
          "Everyone with the link. Search engines can't find the page, so only share the link with the parents of the invited children. With a password, only people who know it can see the list.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "school-start",
    name: "First day of school",
    title: "Create an invitation for a first-day-of-school party",
    metaTitle: "First Day of School Party Invitations – GASTZILLA",
    description:
      "First-day-of-school party or back-to-school get-together: family and friends RSVP via a link without an account and note what they're bringing.",
    teaser: "A party for the first day of school or a back-to-school get-together – who's coming after school?",
    intro: [
      "The first day of school is a big day – for the new pupil and the whole family. In Germany it's celebrated as Einschulung: after the welcome ceremony at school, family and friends often carry on with coffee and cake at home or in a restaurant. Who's coming to the ceremony, who's only coming afterwards, and who's bringing a cake?",
      "Classes, parents and friends also like to meet at the start of the new school year – to get to know each other or for a barbecue. With GASTZILLA you create an invitation page in a few minutes and share the link. Everyone adds themselves – no account or app needed.",
    ],
    benefitsTitle: "Why GASTZILLA works for the first day of school",
    benefits: [
      {
        title: "School ceremony and family party in view",
        text: "Guests say when they'll arrive – for the ceremony at school or only for coffee and cake afterwards.",
      },
      {
        title: "Cakes and little gifts coordinated",
        text: "Whoever brings a cake or a little something for the school cone notes it down. Everyone sees it, and nothing turns up twice.",
      },
      {
        title: "Grandparents and godparents included",
        text: "Companions are added by name and counted. So you know how many seats you need at home or in the restaurant.",
      },
      {
        title: "Getting to know the new class",
        text: "For a new-class meet-up, just share the link in the class chat – every family signs up themselves.",
      },
    ],
    invitationText: [
      "Dear family and friends,",
      "[Name] is starting school – and we want to celebrate! 🎒",
      "When: [date], from [time] (after the school ceremony)",
      "Where: [place]",
      "Please reply here by [date] and let us know if you're bringing a cake: [Link]",
      "We look forward to seeing you!",
      "[Your names]",
    ],
    faq: [
      {
        question: "How do you celebrate the first day of school?",
        answer:
          "Usually with a small family party after the school ceremony: coffee and cake or a meal at home or in a restaurant, with grandparents, godparents and friends. In Germany the child also gets a Schultüte – a large cone filled with sweets and school supplies.",
      },
      {
        question: "How many people can come to the school ceremony?",
        answer:
          "Each school decides – often only a few companions per child because seating is limited. The party afterwards is up to you: with GASTZILLA grandparents, godparents and friends add themselves.",
      },
      {
        question: "When should I send invitations for a first-day-of-school party?",
        answer:
          "About three to four weeks before. The school will tell you the exact date of the first day.",
      },
      {
        question: "Who can see the replies to the school party?",
        answer:
          "Everyone with the link. Search engines can't find the page. Only share the link with the families you're inviting – or protect the page with a password as well.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "school-events",
    name: "School & nursery events",
    title: "Organise school and nursery events – sign-ups by link",
    metaTitle: "School & Nursery Events: Sign-Ups by Link – GASTZILLA",
    description:
      "Leavers' party, summer fair, lantern walk or open day: families sign up via a link without an account and note what they're bringing. Free & ad-free.",
    teaser: "Leavers' party, summer fair, lantern walk or open day – sign-ups and the cake stall via one link.",
    intro: [
      "Whether it's a leavers' party for the preschoolers, an end-of-primary celebration, a summer fair, a lantern walk, a parents' evening or an open day: whoever organises an event at a nursery or school collects sign-ups, helpers and cake donations – usually via notes on the noticeboard and lots of messages.",
      "With GASTZILLA, nursery staff, teachers or the parents' association create a page for the event in a few minutes and share the link. Families add themselves – no account or app needed.",
    ],
    benefitsTitle: "Why GASTZILLA works for school and nursery events",
    benefits: [
      {
        title: "A cake stall without the paperwork",
        text: "Families note what they're contributing to the buffet – cake, salad or drinks. Everyone sees it, and the buffet stays nicely mixed.",
      },
      {
        title: "Know how many are coming",
        text: "Siblings, parents and grandparents are added and counted. So you can plan benches, food and drinks.",
      },
      {
        title: "One link for every family",
        text: "Share the link via WhatsApp, Signal, Telegram or email – or print it in the letter to parents.",
      },
      {
        title: "Time slots in view",
        text: "Families say when they're coming – handy for an open day, so you know how many visitors will be there when.",
      },
    ],
    invitationText: [
      "Dear parents,",
      "we warmly invite you to [our summer fair / our leavers' party / our lantern walk / our open day]! 🏫",
      "When: [date], [start time] to [end time]",
      "Where: [nursery / school, address]",
      "Please sign up here by [date] and let us know if you're bringing something for the buffet: [Link]",
      "We look forward to seeing you!",
      "[Nursery team / parents' association]",
    ],
    faq: [
      {
        question: "What do you bring to a school summer fair?",
        answer:
          "Families usually contribute to the buffet – cakes, muffins, salads, fruit or drinks. With GASTZILLA each family notes what they're bringing, so the buffet stays nicely mixed.",
      },
      {
        question: "Does it work for an open day?",
        answer:
          "Yes. Interested families sign up and say when they'd like to come, so you know how many visitors to expect at what time. Bear in mind: everyone with the link can see the sign-ups.",
      },
      {
        question: "Who can see the sign-ups?",
        answer:
          "Everyone with the link – so every family you send it to. Search engines can't find the page. With a password you also make sure only invited families can open the list. Families can sign up with just a first name or as “the M. family”.",
      },
      {
        question: "Does the school or nursery need its own account?",
        answer:
          "A free account for the person organising the event is enough. Families need no account and no app.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "graduation",
    name: "Graduation party & prom",
    title: "Plan a graduation party or prom together by link",
    metaTitle: "Plan a Graduation Party or Prom – GASTZILLA",
    description:
      "Graduation party, prom or leavers' ball: classmates, families and teachers RSVP via a link without an account and add their guests. Free & ad-free.",
    teaser: "Prom, leavers' party or graduation celebration – who's coming, with how many guests, and who's helping?",
    intro: [
      "Exams are done – time to celebrate! Whether it's a prom or leavers' ball with families and teachers, a last-day-of-school party, a graduation party at home or a celebration with friends: whoever organises it needs to know who's coming, how many guests each person brings and who's helping to set up.",
      "With GASTZILLA you create a page for your celebration in a few minutes and share the link in your year group chat. Everyone adds themselves – no account or app needed.",
    ],
    benefitsTitle: "Why GASTZILLA works for a graduation party",
    benefits: [
      {
        title: "Guests per person in view",
        text: "Everyone notes who they're bringing – parents, siblings or a partner. So you know how many seats you need at the ball.",
      },
      {
        title: "Helpers for decorations and set-up",
        text: "Whoever takes care of decorations, music, drinks or set-up notes it down. Everyone sees it, and nothing gets forgotten.",
      },
      {
        title: "A schedule for the big day",
        text: "Guests say when they're arriving – for the certificate ceremony or only for the ball in the evening.",
      },
      {
        title: "One link for the whole year group",
        text: "Share the link via WhatsApp, Signal, Telegram or email – with classmates, families and teachers.",
      },
    ],
    invitationText: [
      "Hi everyone,",
      "we made it – time for [prom / the graduation party / the leavers' party]! 🎓",
      "When: [date], from [time]",
      "Where: [place]",
      "Please sign up here by [date] and let us know how many guests you're bringing and how you can help: [Link]",
      "See you there!",
      "[Your prom committee / your name]",
    ],
    faq: [
      {
        question: "When should you send graduation party invitations?",
        answer:
          "Usually three to four weeks before a graduation party. For a prom or ball, the venue is often booked a year or more ahead, and the guests' replies are collected two to three months before.",
      },
      {
        question: "Who do you invite to a graduation party?",
        answer:
          "Usually the graduates with their families and partners – for a prom or ball also teachers. How many guests each person may bring is up to you: with GASTZILLA everyone adds their own guests.",
      },
      {
        question: "Can I sell prom tickets through GASTZILLA?",
        answer:
          "No. GASTZILLA only collects replies. You handle ticket sales and payment as usual – but with the right number of guests.",
      },
      {
        question: "Who can see who's coming to prom?",
        answer:
          "Everyone with the link – your year group and anyone they forward it to. Search engines can't find the page. To keep the list tighter, protect it with a password.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "birthday",
    name: "Birthday party",
    title: "Create a birthday party invitation online",
    metaTitle: "Birthday Party Invitations Online – GASTZILLA",
    description:
      "Birthday invitation by link: guests RSVP without an account, bring a plus-one and leave you a message – whether 18th, 30th or 50th. Free & ad-free.",
    teaser: "18th, 30th or 60th – RSVPs, plus-ones and birthday wishes in one list.",
    intro: [
      "Whether it's a small get-together or a big milestone birthday: a week before, you start wondering who's actually coming. Some said yes in the group chat, others by voice note, and from some you've heard nothing at all.",
      "With GASTZILLA you create an invitation page for your birthday in a few minutes and share the link. Your guests add themselves – no account or app needed – and you have every reply in one list.",
    ],
    benefitsTitle: "Why GASTZILLA works for your birthday",
    benefits: [
      {
        title: "Every RSVP in one place",
        text: "Instead of counting messages, you see at a glance who's coming. You get an email for every yes or no.",
      },
      {
        title: "Partners and friends welcome",
        text: "Guests add partners, friends or children by name. So you know how many people to plan food and drinks for.",
      },
      {
        title: "Birthday wishes and notes",
        text: "Every reply can come with a message – for birthday wishes or a heads-up that someone's running late.",
      },
      {
        title: "Fill the buffet together",
        text: "Whoever brings a cake, a salad or drinks notes it down. Everyone sees it, and nothing turns up twice.",
      },
    ],
    invitationText: [
      "Hi everyone,",
      "I'm turning [age] – and I'd love to celebrate with you! 🥳",
      "When: [date] from [time]",
      "Where: [place]",
      "Please let me know by [date] via this link whether you're coming and who you're bringing: [Link]",
      "Can't wait to see you!",
      "[Your name]",
    ],
    faq: [
      {
        question: "How far in advance should you send birthday party invitations?",
        answer:
          "Two to three weeks is usually enough for a small party. For a milestone birthday with lots of guests, four to six weeks is common.",
      },
      {
        question: "Can you invite people to a birthday party on WhatsApp?",
        answer:
          "Yes, that's completely normal today. With GASTZILLA you send a link to your invitation page via WhatsApp – all the details are there, and the replies are collected in one list instead of scattered across the chat.",
      },
      {
        question: "Can I plan a surprise party?",
        answer:
          "Yes – send the link only to the guests, not to the birthday person. Everyone with the link can see the guest list; search engines can't find the page. Add a password too, and the surprise stays safe even if the link reaches the birthday person.",
      },
      {
        question: "How do I get RSVPs by a deadline?",
        answer:
          "Name the deadline in your invitation text, for example “Please reply by 1 May”. You get an email for every yes or no, and the list shows who's in – and who can't make it.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "wedding",
    name: "Wedding",
    title: "Create an online wedding invitation with guest list and RSVP",
    metaTitle: "Online Wedding Invitation & RSVP – GASTZILLA",
    description:
      "Digital wedding invitation with a guest list: guests RSVP via a link, add their plus-ones by name and leave you a message. Free & ad-free.",
    teaser: "RSVPs with plus-ones, names and a personal message – all in one list.",
    intro: [
      "At a wedding you want to focus on the lovely things – not on replies trickling in by phone, WhatsApp and scraps of paper. Who's bringing a partner, who's bringing the kids, and how many of you will there really be in the end?",
      "With GASTZILLA you create an invitation page for your wedding, engagement party or rehearsal dinner and send just one link. Your guests add themselves – no account or app needed – and you always have the current guest list.",
    ],
    benefitsTitle: "Why GASTZILLA works for your wedding",
    benefits: [
      {
        title: "Plus-ones by name",
        text: "Guests add partners, children or other companions by name. So you know exactly who's coming – handy for your seating plan and place cards.",
      },
      {
        title: "Personal messages",
        text: "Every reply can come with a message: congratulations, allergies, a song request for the party. It all lands with you in one place.",
      },
      {
        title: "Always the current list",
        text: "You get an email for every yes or no. If someone changes their entry, you see it straight away – no spreadsheet, no recounting.",
      },
      {
        title: "One link for every guest",
        text: "Send the invitation via WhatsApp, Signal, Telegram or email – to family as well as friends and colleagues.",
      },
    ],
    invitationText: [
      "Dear family and friends,",
      "we're getting married! 💍",
      "On [date] we'd love to celebrate our wedding with you.",
      "Venue: [place], ceremony at [time]",
      "Please let us know by [date] via this link whether you can come and who's joining you: [Link]",
      "We can't wait to celebrate with you!",
      "[Your names]",
    ],
    faq: [
      {
        question: "When should wedding RSVPs be due?",
        answer:
          "A common rule is three to four weeks before the wedding, so there's still time for final numbers, catering and the seating plan. Invitations usually go out three to four months ahead, a save-the-date six to twelve months ahead. With GASTZILLA you can set up the page early and add details later – links you've already sent keep working. If the wedding is more than three months away, you'll need a paid event for that.",
      },
      {
        question: "How many wedding guests decline?",
        answer:
          "Couples often plan for about ten to twenty percent declining – depending on travel and the time of year. With GASTZILLA guests reply yes or no via the link, so you always see who's coming and who isn't, and can follow up with the rest.",
      },
      {
        question: "Can guests add their plus-one?",
        answer:
          "Yes. Partners, children or other companions are added by name when guests reply, and counted – handy for your seating plan and place cards.",
      },
      {
        question: "Who can see our wedding guest list?",
        answer:
          "Everyone with the invitation link. Search engines can't find your event page. Only share the link with the guests you're inviting – or protect the page with a password as well.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "bachelor-party",
    name: "Hen & stag party",
    title: "Plan a hen or stag party – invitations by link",
    metaTitle: "Plan a Hen or Stag Party by Link – GASTZILLA",
    description:
      "Hen do, stag do, bachelor or bachelorette party: friends RSVP via a link without an account – for one night or a whole weekend. Free & ad-free.",
    teaser: "A night out or a whole weekend – who's in, and who's sorting the T-shirts, games and drinks?",
    intro: [
      "Hen do or stag do, bachelor or bachelorette party, one night in town or a whole weekend away: for a great send-off, the best man, the maid of honour and friends have lots to coordinate. Who's in, who's joining later, and who's sorting the T-shirts, games or decorations?",
      "With GASTZILLA you create a page for the party in a few minutes and share the link with the group. Everyone adds themselves – no account or app needed – and you keep the overview.",
    ],
    benefitsTitle: "Why GASTZILLA works for a hen or stag do",
    benefits: [
      {
        title: "How big is the group?",
        text: "The list shows everyone with the link who's said yes. So you know early how many people to book accommodation, a table or activities for.",
      },
      {
        title: "Share out the jobs",
        text: "T-shirts, games, decorations or drinks – everyone notes what they're taking on. Everyone sees it, and nothing gets forgotten.",
      },
      {
        title: "One night or a whole weekend",
        text: "For a weekend away you enter a date range. Guests add when they're arriving and, if they like, how long they're staying.",
      },
      {
        title: "Find the date together",
        text: "With lots of diaries, the date is the hardest part. Suggest up to four weekends, everyone votes via the link – and you fix the favourite with one click.",
      },
    ],
    invitationText: [
      "Hi everyone,",
      "[Name] is getting married – time for the [hen do / stag do]! 🥂",
      "When: [date / dates] from [time]",
      "Where / meeting point: [place]",
      "Please sign up here by [date] and let us know what you'll take care of: [Link]",
      "Shh – don't tell!",
      "[Your name]",
    ],
    faq: [
      {
        question: "How long before the wedding is the hen or stag do?",
        answer:
          "Usually a few weeks to two months before the wedding. For a whole weekend away it's worth inviting two to three months ahead, so accommodation and activities can be booked.",
      },
      {
        question: "How many people do you invite to a hen or stag do?",
        answer:
          "It depends on the plans – often close friends and siblings, usually somewhere between a handful and about fifteen people. GASTZILLA shows you early how big the group will be.",
      },
      {
        question: "Can the bride or groom see the planning?",
        answer:
          "Only with the link: everyone who has it can see the list. So only send it to the group that's celebrating – search engines can't find the page. With a password the planning stays secret even if the link gets forwarded.",
      },
      {
        question: "Can I split costs through GASTZILLA?",
        answer:
          "No. GASTZILLA collects the replies and who's doing what. You split the costs among yourselves as usual – but you'll know exactly how many ways.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "baby-shower",
    name: "Baby shower & gender reveal",
    title: "Create a baby shower or gender reveal party invitation online",
    metaTitle: "Baby Shower & Gender Reveal Invitations – GASTZILLA",
    description:
      "Baby shower or gender reveal party: guests RSVP via a link without an account, coordinate gifts and leave their guess. Free & ad-free.",
    teaser: "Baby shower or gender reveal – RSVPs, gift coordination and guesses via one link.",
    intro: [
      "Whether it's a baby shower for the parents-to-be or a gender reveal party where everyone finally finds out if it's a boy or a girl: as the host you want to know who's coming – and make sure five guests don't bring the same babygrow.",
      "With GASTZILLA you create an invitation page in a few minutes and share the link. Friends and family add themselves – no account or app needed.",
    ],
    benefitsTitle: "Why GASTZILLA works for a baby shower",
    benefits: [
      {
        title: "Gifts without duplicates",
        text: "Whoever brings something – a gift, a cake or decorations – notes it down. Everyone sees it, and nothing gets given twice.",
      },
      {
        title: "Boy or girl? Collect the guesses",
        text: "At a gender reveal party guests simply leave their guess as a message with their reply – the answer comes at the party.",
      },
      {
        title: "Partners and children counted",
        text: "Partners and children are added by name and counted. So you know how many guests are coming.",
      },
    ],
    invitationText: [
      "Hi everyone,",
      "[we're having a baby / Name is having a baby] – and we'd love to celebrate with you! 🍼",
      "When: [date] from [time]",
      "Where: [place]",
      "Please reply here and let us know what you're bringing – for the gender reveal, add your guess too: boy or girl? [Link]",
      "We look forward to seeing you!",
      "[Your name]",
    ],
    faq: [
      {
        question: "When should you have a baby shower?",
        answer:
          "Usually in the last trimester, a few weeks before the due date. A gender reveal party is often held as soon as the baby's sex is known.",
      },
      {
        question: "How far in advance should baby shower invitations be sent?",
        answer:
          "About three to four weeks before the shower is common. That gives guests time to plan and choose a gift.",
      },
      {
        question: "Do you bring a gift to a gender reveal party?",
        answer:
          "It's not expected, but many guests bring a small gift or something for the buffet. With GASTZILLA everyone notes what they're bringing – so nothing is given twice.",
      },
      {
        question: "Can the parents-to-be see the planning?",
        answer:
          "Everyone with the invitation link can see the list; search engines can't find your event page. If you're planning a surprise for the parents-to-be, don't send them the link – and ideally protect the page with a password as well.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "christening",
    name: "Christening & communion",
    title: "Create an invitation for a christening, communion or confirmation",
    metaTitle: "Christening, Communion & Confirmation Invites – GASTZILLA",
    description:
      "Christening, first communion, confirmation or bar mitzvah: family and godparents RSVP via a link without an account and add their companions.",
    teaser: "Christening, communion, confirmation or bar mitzvah – who's coming to the service, who to the party?",
    intro: [
      "Whether it's a christening, first communion, confirmation, a bar or bat mitzvah or a Jugendweihe: these celebrations bring the whole family together – often with godparents, grandparents and friends travelling from far away. Who's coming to the service, who's only coming to the party afterwards, and how many people should you book the restaurant table for?",
      "With GASTZILLA you create an invitation page in a few minutes and share the link. Everyone adds themselves – no account or app needed – and you have all the replies in one list.",
    ],
    benefitsTitle: "Why GASTZILLA works for a christening or communion",
    benefits: [
      {
        title: "Service and party in view",
        text: "Guests say when they're arriving – for the service or only for the party afterwards. So you know who's there when.",
      },
      {
        title: "Book for the right number",
        text: "Partners and children are added by name and counted. So you know how many people to plan for at the restaurant or with the caterer.",
      },
      {
        title: "Gifts and cakes coordinated",
        text: "Whoever brings a gift or a cake notes it down. Everyone sees it, and nothing gets given twice.",
      },
      {
        title: "Easy for every generation",
        text: "One link via WhatsApp, Signal, Telegram or email is all it takes – grandparents and godparents need no app and no account either.",
      },
    ],
    invitationText: [
      "Dear family and friends,",
      "we're celebrating [the christening / the first communion / the confirmation] of [name] and warmly invite you! 🕊️",
      "Service: [date], [time], [church]",
      "Celebration afterwards: from [time], [place]",
      "Please reply here by [date] and let us know who's coming with you: [Link]",
      "We look forward to seeing you!",
      "[Your names]",
    ],
    faq: [
      {
        question: "Who do you invite to a christening?",
        answer:
          "Usually family, godparents and close friends. Many families invite a wider circle to the service and a smaller one to the meal afterwards – with GASTZILLA guests say which part they're coming to.",
      },
      {
        question: "How far in advance should you send christening invitations?",
        answer:
          "About four to six weeks before is common, so godparents and relatives from further away can plan.",
      },
      {
        question: "Can guests say whether they're coming to the service?",
        answer:
          "Yes. Guests give their arrival time – so you see who's coming to the service and who's only coming to the party afterwards.",
      },
      {
        question: "Does GASTZILLA work for a bar mitzvah or Jugendweihe too?",
        answer:
          "Yes. GASTZILLA is made for any celebration. You choose the title, greeting and design yourself.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "funeral",
    name: "Funeral & memorial",
    title: "Funeral, burial or memorial service – create an invitation online",
    metaTitle: "Funeral & Memorial Service Invitation Online – GASTZILLA",
    description:
      "Funeral, burial, memorial service or wake: relatives and friends let you know via a link whether they're coming – password-protected if you wish.",
    teaser: "Funeral, burial or the gathering afterwards – know calmly who's coming.",
    intro: [
      "When someone you love dies, there's little time and a lot to organise: the funeral, the burial or interment of ashes, often followed by a wake or reception. You need to know who's coming – and many phone calls and messages are an extra burden at this time.",
      "With GASTZILLA you create a simple page with the place and time and share the link with family, friends and acquaintances. They let you know themselves whether they're coming – no account or app needed. If you wish, you can protect the page with a password.",
    ],
    benefitsTitle: "How GASTZILLA helps with a funeral",
    benefits: [
      {
        title: "Know who's coming to the reception",
        text: "Relatives and friends reply themselves and add anyone coming with them. So you know how many people to book the café or restaurant for.",
      },
      {
        title: "Service, burial and reception in view",
        text: "Guests say when they're coming – to the service, or only to the burial or the reception afterwards.",
      },
      {
        title: "Replies without phone calls",
        text: "Those who can come say yes; those who can't say so and can leave a few words. You don't have to chase anyone by phone.",
      },
      {
        title: "Protected and without advertising",
        text: "The page doesn't appear in search engines and can be protected with a password. GASTZILLA shows no advertising.",
      },
    ],
    invitationText: [
      "Dear family, friends and acquaintances,",
      "it is with great sadness that we say goodbye to [name].",
      "The funeral service will take place on [date] at [time] at [place], followed by [the burial / a reception at place].",
      "Please let us know via this link whether you will be attending: [Link]",
      "[Your names]",
    ],
    faq: [
      {
        question: "Can you invite people to a funeral via WhatsApp?",
        answer:
          "Yes, that's common today – especially when time is short. With GASTZILLA you send one link via WhatsApp, email or text message; the place and time are there, and the replies are collected for you. Relatives without a smartphone are of course still best reached in person.",
      },
      {
        question: "Who do you invite to a funeral and the wake?",
        answer:
          "Usually anyone who wishes to say goodbye can attend the funeral service – the place and time are often in the death notice. Many families invite more selectively to the wake or reception afterwards, such as family, close friends and companions. You then send the reply link only to those guests.",
      },
      {
        question: "How early should you arrive at a funeral?",
        answer:
          "It's customary to arrive about fifteen minutes before the start, so you can settle in calmly and find a seat.",
      },
      {
        question: "Who can see the funeral page?",
        answer:
          "Only people with the link – and if you set a password, only those who also know the password. Search engines can't find the page. A plain, understated colour design suits a quiet setting.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "company-party",
    name: "Office party",
    title: "Create an office party invitation online",
    metaTitle: "Office Party Invitations Online – GASTZILLA",
    description:
      "Invite to the office Christmas party or summer party by link: colleagues RSVP without an account, and you see every reply at a glance. Ad-free, EU servers.",
    teaser: "Christmas party, summer party or team event – colleagues' RSVPs without survey chaos.",
    intro: [
      "Whether it's the office Christmas party, a summer party or a team event: whoever organises it usually chases replies – by email, in the team chat and in the corridor. In the end nobody quite knows how many people to order for.",
      "With GASTZILLA you create an invitation page in a few minutes and share the link with the team. Colleagues add themselves – no account, no app, and nobody has to analyse a survey.",
    ],
    benefitsTitle: "Why GASTZILLA works for an office party",
    benefits: [
      {
        title: "One link for the whole team",
        text: "Copy the invitation link into the team chat, the newsletter or an email. Anyone who has it can sign up – no registration needed.",
      },
      {
        title: "Numbers you can plan with",
        text: "Companions are counted and arrival times are listed. So you know how many people to plan food and drinks for.",
      },
      {
        title: "Buffet and team breakfast coordinated",
        text: "For a team breakfast or a summer party with a buffet, everyone notes what they're bringing. Duplicate salads and missing drinks show up straight away.",
      },
      {
        title: "Data-minimal",
        text: "GASTZILLA is ad-free, uses no tracking cookies and stores data on servers in the EU.",
      },
    ],
    invitationText: [
      "Dear colleagues,",
      "we warmly invite you to our [Christmas party / summer party / team event]! 🎉",
      "When: [date], from [time]",
      "Where: [place]",
      "Please sign up via this link by [date] so we can plan properly: [Link]",
      "Looking forward to a great evening with you!",
      "[Your name / team]",
    ],
    faq: [
      {
        question: "What can you do for an office party?",
        answer:
          "Popular ideas are a summer party with a barbecue, a Christmas party at a restaurant, a team event such as an escape room, bowling or a cooking class, or a day trip together.",
      },
      {
        question: "How far in advance should you invite to the office Christmas party?",
        answer:
          "Six to eight weeks is common for Christmas parties, because December dates fill up fast. Three to four weeks is usually enough for a summer party or team event. If the evening isn't fixed yet, suggest up to four dates and let the team vote via the link.",
      },
      {
        question: "Do colleagues need to register?",
        answer:
          "No. They open the invitation link in their browser and sign up. Only you as the organiser need a free account.",
      },
      {
        question: "Is GASTZILLA suitable for companies?",
        answer:
          "GASTZILLA is ad-free, uses no tracking cookies and stores data on servers in the EU. Participants only enter their name – they don't need an account.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "barbecue",
    name: "BBQ & garden party",
    title: "Create a BBQ party invitation online",
    metaTitle: "BBQ Party Invitations Online – GASTZILLA",
    description:
      "Plan a BBQ or garden party by link: guests RSVP without an account and note what they're bringing – salad, meat or drinks. Free & ad-free.",
    teaser: "Guests note what they're bringing – salad, food for the grill or drinks.",
    intro: [
      "A BBQ lives on everyone bringing something. And that's exactly where it gets chaotic: three pasta salads, no bread, and everyone left the drinks to someone else. On top of that, replies get lost somewhere in the group chat.",
      "With GASTZILLA you create an invitation page for a barbecue, garden party or summer party and share the link. Your guests add themselves and note what they're bringing – no account or app needed.",
    ],
    benefitsTitle: "Why GASTZILLA works for a BBQ",
    benefits: [
      {
        title: "What everyone's bringing, at a glance",
        text: "Every guest notes what they're bringing. Everyone sees it – so you get salad, bread and drinks instead of five potato salads.",
      },
      {
        title: "Come and go as it suits",
        text: "Guests say when they're arriving and, if they like, how long they're staying. Handy for firing up the grill at the right time.",
      },
      {
        title: "Bring family and friends",
        text: "Companions are added and counted. So you know how many sausages and chairs you need.",
      },
      {
        title: "One link for every channel",
        text: "Share the invitation via WhatsApp, Signal, Telegram or email – with neighbours, friends and family at once.",
      },
    ],
    invitationText: [
      "Hi everyone,",
      "the grill is getting fired up! 🔥",
      "When: [date] from [time]",
      "Where: [place]",
      "[Food for the grill and drinks] are sorted – if you like, bring a salad or dessert. Please sign up here and let us know what you're bringing: [Link]",
      "See you soon!",
      "[Your name]",
    ],
    faq: [
      {
        question: "What do you bring to a BBQ party?",
        answer:
          "Salads, bread, dips, dessert or drinks are typical – often everyone also brings their own food for the grill. With GASTZILLA everyone notes what they're bringing; because everyone sees the list, the buffet sorts itself out.",
      },
      {
        question: "What if it rains on the day of the BBQ?",
        answer:
          "Simply change the place or time on your event page – anyone who opens the link sees the current details straight away. It's best to send a quick note to the group as well.",
      },
      {
        question: "Can guests change their reply later?",
        answer:
          "Yes. If something changes – a different time, an extra guest, something else to bring or a no after all – they simply update their entry. You get an email about it.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "carnival-party",
    name: "Carnival",
    title: "Carnival party or carnival session – create an invitation online",
    metaTitle: "Carnival Party Invitations Online – GASTZILLA",
    description:
      "Carnival party, carnival session or 11 November: guests RSVP via a link without an account, reveal their costume and note what they're bringing.",
    teaser: "Party, carnival session, 11 November or Rose Monday – RSVPs, costumes and food via one link.",
    intro: [
      "Alaaf and Helau! Whether it's the start of the season on 11 November, a trip to a carnival session, Weiberfastnacht or Rose Monday in Cologne, Düsseldorf or Mainz: when carnival kicks off, everything needs to be ready. Who's coming, how many session tickets do you need, who's meeting before the parade, and who's bringing beer, doughnuts or meatballs? In the group chat it quickly gets lost between costume photos.",
      "With GASTZILLA you create an invitation page for your carnival party or session trip in a few minutes and share the link. Your guests add themselves – no account or app needed – and you see every reply in one list.",
    ],
    benefitsTitle: "Why GASTZILLA works for carnival",
    benefits: [
      {
        title: "Who's coming as what?",
        text: "Guests can add a message to their reply – what they're dressing up as, for example. So you can coordinate, and you won't get five pirates.",
      },
      {
        title: "Off to the carnival session together",
        text: "Everyone signs up with their companions – so you know in time how many tickets to get for the session.",
      },
      {
        title: "Meet before and after the parade",
        text: "Guests say when they're arriving and, if they like, how long they're staying. If you celebrate from Weiberfastnacht to Rose Monday, just enter a date range.",
      },
      {
        title: "Food and drinks for the party",
        text: "Whoever brings doughnuts, meatballs or drinks notes it down. Everyone sees it, and the buffet works out.",
      },
    ],
    invitationText: [
      "Alaaf and Helau, fellow revellers! 🎉",
      "We're [celebrating Weiberfastnacht / going to a carnival session together / celebrating 11 November]!",
      "When: [date] from [time]",
      "Where: [place]",
      "Costumes are a must! Reply here, tell us what you're coming as and note what you're bringing: [Link]",
      "[Your name]",
    ],
    faq: [
      {
        question: "Can I plan a whole carnival weekend?",
        answer:
          "Yes. Enter a date range, for example from Weiberfastnacht to Rose Monday. Guests note when they're joining.",
      },
      {
        question: "Can I buy carnival session tickets through GASTZILLA?",
        answer:
          "No. GASTZILLA only collects replies. You get the tickets from the carnival club as usual – but in the right number.",
      },
      {
        question: "Which design suits a carnival invitation?",
        answer:
          "A bold, colourful design gives your invitation page instant carnival spirit – for free. For something more playful, choose one of the paid premium designs.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "oktoberfest",
    name: "Oktoberfest",
    title: "Oktoberfest party or trip to the Wiesn – create an invitation online",
    metaTitle: "Oktoberfest Party & Wiesn Trip Invitations – GASTZILLA",
    description:
      "Oktoberfest party at home or a trip to the Wiesn: guests RSVP via a link without an account – and you know how many to book the beer tent for.",
    teaser: "An Oktoberfest party at home or a trip to the Wiesn – RSVPs, pretzels and meeting point via one link.",
    intro: [
      "O'zapft is! Whether it's an Oktoberfest party in the garden or basement, a trip to the Wiesn in Munich, the Cannstatter Wasen or an Oktoberfest in your town: to make sure the table in the beer tent is big enough and there are enough pretzels, you need to know who's coming.",
      "With GASTZILLA you create an invitation page for your Oktoberfest party or Wiesn trip in a few minutes and share the link. Everyone adds themselves – no account or app needed – and you have all the replies in one list.",
    ],
    benefitsTitle: "Why GASTZILLA works for Oktoberfest",
    benefits: [
      {
        title: "Book the right table in the tent",
        text: "Everyone signs up and names their companions. So you know how many people to reserve a table in the tent for.",
      },
      {
        title: "Pretzels, Obatzda and Weisswurst",
        text: "At a party at home, everyone notes what they're bringing. Everyone sees it – and you won't run out of mustard or pretzels.",
      },
      {
        title: "Meeting point outside the tent",
        text: "Place and time are on the page. Anyone arriving later or leaving early simply says so in their reply.",
      },
    ],
    invitationText: [
      "Servus, everyone! 🥨",
      "O'zapft is – we're [celebrating Oktoberfest at mine / going to the Wiesn together]!",
      "When: [date] from [time]",
      "Where / meeting point: [place]",
      "Please sign up here by [date] so I can [reserve the table / get enough pretzels] – and let me know what you're bringing: [Link]",
      "Dirndl and lederhosen welcome!",
      "[Your name]",
    ],
    faq: [
      {
        question: "When can you reserve a table at the Oktoberfest?",
        answer:
          "Each tent sets its own rules – for the big tents, often many months in advance. So collect replies early, and you'll know in time how many seats to ask for.",
      },
      {
        question: "How many people fit at an Oktoberfest table?",
        answer:
          "A table in the beer tent usually seats around ten people. With the reply list you know how many tables to request.",
      },
      {
        question: "Can I reserve a beer tent table through GASTZILLA?",
        answer:
          "No. GASTZILLA only collects replies. You make the reservation with the tent as usual – but with the right number of people.",
      },
      {
        question: "What do you bring to an Oktoberfest party?",
        answer:
          "Pretzels, Obatzda, sausages, potato salad or drinks are typical. With GASTZILLA everyone notes what they're bringing, so the Bavarian buffet comes together without duplicates.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "halloween-party",
    name: "Halloween party",
    title: "Create a Halloween party invitation online",
    metaTitle: "Halloween Party Invitations Online – GASTZILLA",
    description:
      "Organise a Halloween party by link: guests RSVP without an account, reveal their costume and note which snacks they're bringing. Free & ad-free.",
    teaser: "RSVPs, costume reveals and spooky snacks – all via one link.",
    intro: [
      "A great Halloween party needs costumes, pumpkins and spooky snacks – and an overview of who's actually coming. That's easily lost when replies are scattered across every chat.",
      "With GASTZILLA you create an invitation page for your Halloween party and share the link. Your guests add themselves, no account or app needed – and you see every reply in one list.",
    ],
    benefitsTitle: "Why GASTZILLA works for a Halloween party",
    benefits: [
      {
        title: "A design to match",
        text: "Choose a dark or bold colour design – and give your invitation the right spooky look.",
      },
      {
        title: "Coordinate costumes",
        text: "Guests can add a message to their reply – what they're coming as, for example. So you won't get three Draculas.",
      },
      {
        title: "Plan the spooky buffet",
        text: "Whoever brings pumpkin soup, monster muffins or drinks notes it down. Everyone sees what's already covered.",
      },
      {
        title: "One link for the whole crew",
        text: "Share the invitation via WhatsApp, Signal, Telegram or email. You get an email for every yes or no.",
      },
    ],
    invitationText: [
      "Hello, creatures of the night! 🎃",
      "You're invited to my Halloween party.",
      "When: [date] from [time]",
      "Where: [place]",
      "Costumes encouraged! Reply here, tell us what you're coming as and note which snacks you're bringing: [Link]",
      "Spooky greetings,",
      "[Your name]",
    ],
    faq: [
      {
        question: "How far in advance should you send Halloween party invites?",
        answer:
          "About two to three weeks before – late-October weekends fill up fast, and everyone needs time for their costume.",
      },
      {
        question: "Can I plan a Halloween party for kids?",
        answer:
          "Yes. Parents add their child and say when they'll drop off and pick up again – handy if the kids go trick-or-treating afterwards.",
      },
      {
        question: "Which design suits a Halloween invitation?",
        answer:
          "A dark colour design creates a spooky mood – for free. If you want more, choose one of the paid premium designs.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "advent-party",
    name: "Advent & Christmas market",
    title: "Advent gathering, mulled wine evening or Christmas market – invite by link",
    metaTitle: "Advent Party & Christmas Market Trip – GASTZILLA",
    description:
      "Advent gathering, mulled wine evening or Christmas market trip: guests RSVP via a link without an account and say when they're coming. Free & ad-free.",
    teaser: "Advent coffee, mulled wine by the fire or the Christmas market – who's coming when and who's bringing what?",
    intro: [
      "Whether it's Advent coffee with the neighbours, baking biscuits with friends, a mulled wine evening around the fire pit or a stroll round the Christmas market: the Advent season is busy. Who's joining after work, where are you meeting, and who's bringing biscuits or mugs?",
      "With GASTZILLA you create an invitation page for your Advent gathering, mulled wine evening or Christmas market trip in a few minutes and share the link. Your guests add themselves – no account or app needed.",
    ],
    benefitsTitle: "Why GASTZILLA works for the Advent season",
    benefits: [
      {
        title: "Who's coming when?",
        text: "Guests say when they'll drop by and, if they like, how long they're staying. So you know when the mulled wine needs to be warm.",
      },
      {
        title: "Biscuits, mugs, children's punch",
        text: "Everyone notes what they're bringing. Everyone sees it – and you won't run out of mugs or punch for the kids.",
      },
      {
        title: "Off to the Christmas market together",
        text: "Give a meeting point and time – at the entrance or the mulled wine stall, say. Anyone joining later just adds it to their reply.",
      },
      {
        title: "For neighbours, clubs or friends",
        text: "One link via WhatsApp, Signal, Telegram or email is all it takes – for your building as well as your club or circle of friends.",
      },
    ],
    invitationText: [
      "Hi everyone,",
      "to get into the Advent spirit, I'm inviting you for [mulled wine / Christmas biscuits / Advent coffee / a stroll round the Christmas market]. ✨",
      "When: [date] from [time]",
      "Where / meeting point: [place]",
      "Drop by whenever suits you – just sign up here and let me know when you're coming and what you're bringing: [Link]",
      "Warm wishes,",
      "[Your name]",
    ],
    faq: [
      {
        question: "Can I plan a Christmas market trip too?",
        answer:
          "Yes. Give a meeting point and time, for example at the entrance or the mulled wine stall. Anyone joining later simply notes it in their reply.",
      },
      {
        question: "Does it work for an Advent party at a club or in the neighbourhood?",
        answer:
          "Yes. One link is enough for everyone – neighbours, club members or friends add themselves, without an account or app.",
      },
      {
        question: "How far in advance should I invite to an Advent party?",
        answer: "About three to four weeks before – weekends in Advent fill up quickly.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "family-celebration",
    name: "Family & holiday gatherings",
    title: "Family gathering or holiday celebration – create an invitation online",
    metaTitle: "Family Gatherings & Holiday Celebrations – GASTZILLA",
    description:
      "Christmas, Easter, Iftar, Eid, Hanukkah or Thanksgiving: family and friends RSVP via a link without an account and note what they're bringing.",
    teaser: "Christmas, Easter, Iftar, Hanukkah, Thanksgiving & more – who's coming and who's bringing which dish?",
    intro: [
      "Whether it's Christmas or Easter, Iftar during Ramadan or Eid, Hanukkah or Passover, Diwali, Nowruz or Thanksgiving: when the whole family comes together, there's a lot to coordinate. Who's coming on which day, who's bringing which dish, and how many seats do you need at the table? By the time it's all settled, the family chat and the phone are running hot.",
      "With GASTZILLA you create an invitation page for your family celebration and share the link. Everyone adds themselves – no account or app needed, whether grandparents, cousins or family friends.",
    ],
    benefitsTitle: "Why GASTZILLA works for family gatherings",
    benefits: [
      {
        title: "Who's bringing which dish?",
        text: "Everyone notes what they're contributing – starter, main course, dessert or drinks. Everyone sees it, and in the end nothing's missing and nothing's doubled.",
      },
      {
        title: "On time for dinner – or over several days",
        text: "Guests say when they're arriving and, if they like, how long they're staying – on time for breaking the fast, for example. If you celebrate over several days, just enter a date range.",
      },
      {
        title: "The whole family in view",
        text: "Partners and children are added by name and counted. So you know how many seats you need at the table.",
      },
      {
        title: "Wishes and dietary notes",
        text: "Guests can leave a message – about allergies, vegetarian food or dietary rules, for example.",
      },
    ],
    invitationText: [
      "Dear family and friends,",
      "we're celebrating [Christmas / Easter / Iftar / Eid / Hanukkah / Thanksgiving] together! 🍽️",
      "When: [date / dates] from [time]",
      "Where: [place]",
      "So we can plan properly, please sign up here and let us know who's bringing what: [Link]",
      "We look forward to seeing you!",
      "[Your name]",
    ],
    faq: [
      {
        question: "Does GASTZILLA work for religious holidays?",
        answer:
          "Yes. GASTZILLA is made for any celebration – Christmas, Easter, Ramadan, Hanukkah, Diwali or Thanksgiving. You choose the title, greeting and design yourself.",
      },
      {
        question: "What do you bring to an Eid party?",
        answer:
          "Often a dish for the shared table, sweets or a small gift for the children. With GASTZILLA everyone notes what they're bringing when they reply – so the feast comes together and nothing turns up twice.",
      },
      {
        question: "Can guests mention dietary requirements?",
        answer:
          "Yes. Guests simply add allergies, vegetarian food or dietary rules as a message with their reply.",
      },
      {
        question: "How do we find a date that suits the whole family?",
        answer:
          "Let the family vote: you suggest two to four dates, and everyone ticks what works via the link. You fix the date with the most votes – everyone who voted then appears directly in the guest list.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "new-years-eve",
    name: "New Year's Eve",
    title: "Create a New Year's Eve party invitation online",
    metaTitle: "New Year's Eve Party Invitations Online – GASTZILLA",
    description:
      "Plan a New Year's Eve party by link: guests RSVP without an account, say when they're arriving, how long they're staying and what they're bringing.",
    teaser: "Who's celebrating with you, who's bringing the raclette cheese and who's staying for New Year's breakfast?",
    intro: [
      "New Year's Eve plans often only come together at the last minute. Who's celebrating with you, who's only coming after dinner, and who's bringing fizz, raclette cheese or fondue bread? Nobody keeps track of that in the group chat.",
      "With GASTZILLA you create an invitation page for your New Year's Eve party in a few minutes and share the link. Your guests add themselves – no account or app needed – and you see every reply in one list.",
    ],
    benefitsTitle: "Why GASTZILLA works for a New Year's Eve party",
    benefits: [
      {
        title: "Arriving and staying",
        text: "Guests say when they're arriving and, if they like, how long they're staying. So you know who's there for dinner and who's only joining for the countdown.",
      },
      {
        title: "Raclette, fondue or buffet",
        text: "Everyone notes what they're bringing. Everyone sees it – so there's enough cheese, bread and fizz, but no five potato salads.",
      },
      {
        title: "Invite at short notice",
        text: "The invitation page is ready in minutes. Share the link via WhatsApp, Signal, Telegram or email – even a few days before New Year's Eve.",
      },
    ],
    invitationText: [
      "Hi everyone,",
      "let's welcome the new year together! 🥂",
      "When: 31 December from [time]",
      "Where: [place]",
      "There'll be [raclette / fondue / a buffet] – reply here and let me know what you're bringing and how long you're staying: [Link]",
      "See you on New Year's Eve!",
      "[Your name]",
    ],
    faq: [
      {
        question: "How far in advance should I invite to a New Year's Eve party?",
        answer:
          "Ideally three to four weeks before, as many people plan New Year's Eve early. Short notice works too – the page is ready in minutes.",
      },
      {
        question: "What do you bring to a New Year's Eve party?",
        answer:
          "Fizz or other drinks, snacks, salads or ingredients for raclette or fondue are typical. With GASTZILLA everyone notes what they're bringing – everyone sees it, and nothing's missing.",
      },
      {
        question: "What time should a New Year's Eve party start?",
        answer:
          "Often around 7 or 8 pm if you're having dinner together, or later if it's mainly drinks and the countdown. Guests note their arrival time – so you know who's there for dinner.",
      },
      {
        question: "Can guests say whether they're staying overnight?",
        answer:
          "Guests say how long they're staying and can leave a message – whether they need somewhere to sleep, for example.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "theme-party",
    name: "Theme party",
    title: "Create a theme party invitation online",
    metaTitle: "Theme Party Invitations Online – GASTZILLA",
    description:
      "Organise a theme party by link: guests RSVP without an account, reveal their outfit in a message and note what they're bringing. Free & ad-free.",
    teaser: "80s, bad taste or Hawaiian – RSVPs, outfit reveals and food via one link.",
    intro: [
      "Whether it's the 80s, bad taste, Hawaiian or a casino night: a theme party has a lot to sort out. Who's coming, who's coming as what, and who's bringing the matching snacks? In the group chat it all gets lost quickly.",
      "With GASTZILLA you create an invitation page for your theme party, describe the theme in the greeting and share the link. Your guests add themselves – no account or app needed.",
    ],
    benefitsTitle: "Why GASTZILLA works for a theme party",
    benefits: [
      {
        title: "The theme right on the invitation",
        text: "You choose the title, greeting and design yourself – so everyone knows straight away what to expect.",
      },
      {
        title: "Outfit reveals by message",
        text: "Guests can add a message to their reply, such as what they're coming as. So you can coordinate, and nobody turns up in the same costume.",
      },
      {
        title: "Snacks and drinks to match",
        text: "Whoever brings something notes it down. Everyone sees it, and the buffet fits the theme in the end.",
      },
    ],
    invitationText: [
      "Hi everyone,",
      "tonight's theme: [theme]! 🕺",
      "When: [date] from [time]",
      "Where: [place]",
      "Come dressed for the theme – reply here, reveal your outfit and note what you're bringing: [Link]",
      "Can't wait to see you!",
      "[Your name]",
    ],
    faq: [
      {
        question: "What are good theme party ideas?",
        answer:
          "Popular themes include the 80s, the 90s, bad taste, Hawaiian, casino or Hollywood. The key is a theme everyone can easily find an outfit for.",
      },
      {
        question: "How far in advance should I invite to a theme party?",
        answer: "About three to four weeks before, so everyone has time to get a costume.",
      },
      {
        question: "Are there designs to match my theme?",
        answer:
          "Yes. You choose one of the free colour designs or a paid premium design and tailor the title and greeting to your theme.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "group-travel",
    name: "Group trip",
    title: "Organise a group trip or club outing – sign-ups by link",
    metaTitle: "Organise a Group Trip or Club Outing – GASTZILLA",
    description:
      "Coach trip to Paris or Amsterdam, weekend away or club outing: participants sign up via a link without an account – with companions. Free & ad-free.",
    teaser: "Coach trip to Paris, weekend away or club outing – sign-ups with companions in one list.",
    intro: [
      "Whether it's a coach trip to Paris or Amsterdam, a weekend away with friends or your club's annual outing: on a group trip everything depends on the number of participants. How big does the coach need to be, how many rooms do you need, and who's bringing a partner? Collect sign-ups by chat and phone, and you'll end up counting by hand again.",
      "With GASTZILLA you create a page for your trip – with dates, departure point and contact details – and share the link. Everyone signs up themselves, no account or app needed, and you always have the current list of participants.",
    ],
    benefitsTitle: "Why GASTZILLA works for a group trip",
    benefits: [
      {
        title: "Numbers for coach and hotel",
        text: "Everyone signs up and adds companions by name. So you know how many coach seats and rooms you need.",
      },
      {
        title: "Travel dates and departure point",
        text: "Enter the dates from and to, and name the departure point. Your contact details are right on the page in case anyone has questions.",
      },
      {
        title: "Requests right in the sign-up",
        text: "Participants can leave a message – a room request, say, or that they'll join along the way.",
      },
      {
        title: "One link for the whole club",
        text: "Share the sign-up via WhatsApp, Signal, Telegram or email. You get an email for every new sign-up.",
      },
    ],
    invitationText: [
      "Hi everyone,",
      "we're going to [destination] together! 🚌",
      "When: [start date] to [end date]",
      "Departure: [time], [departure point]",
      "Please sign up via this link by [date] and add anyone coming with you by name – room requests welcome as a message: [Link]",
      "Questions? Reach me on [phone].",
      "[Your name]",
    ],
    faq: [
      {
        question: "How far in advance should you plan a group trip?",
        answer:
          "For a weekend away a few months is often enough; for trips abroad or in peak season, many groups start six months or more ahead. The earlier you know the numbers, the easier it is to book the coach and accommodation.",
      },
      {
        question: "Can I book or take payment for the trip through GASTZILLA?",
        answer:
          "No. GASTZILLA only collects sign-ups. You organise the coach, hotel and payment yourself as usual – but with the right number of participants.",
      },
      {
        question: "Do participants need to register?",
        answer: "No. They open the link in their browser and sign up. Only you as the organiser need a free account.",
      },
      {
        question: "How do we choose the travel dates together?",
        answer:
          "Suggest two to four possible dates and let the group vote via the link. You'll see when most people can come – and book the coach and accommodation for the favourite.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "culture-outing",
    name: "Cinema, theatre & museum",
    title: "Cinema, theatre, opera or museum – plan a group visit by link",
    metaTitle: "Group Visits to Theatre, Cinema & Museum – GASTZILLA",
    description:
      "Cinema, theatre, opera, museum, concert or stadium: invite by link, everyone RSVPs without an account – and you know how many tickets you need. Free.",
    teaser: "Cinema, theatre, opera, museum or concert – see who's coming and how many tickets you need.",
    intro: [
      "Going to the cinema, theatre or opera together, a museum visit, a concert or a home game at the stadium – the idea comes quickly. Then the asking starts: who's coming, who's bringing someone, and how many tickets do you need to get?",
      "With GASTZILLA you create a page for your visit in a few minutes and share the link. Everyone adds themselves – no account or app needed – and you see straight away how many people to expect.",
    ],
    benefitsTitle: "Why GASTZILLA works for a cultural outing",
    benefits: [
      {
        title: "Know how many tickets you need",
        text: "Everyone signs up and names their companions. The list always shows how many tickets or places on a group tour you need.",
      },
      {
        title: "Meeting point before the show",
        text: "Place, date and time are on the page, along with your contact details. Guests say when they'll be at the meeting point – with a little time before it starts.",
      },
      {
        title: "Who already has a ticket?",
        text: "Guests note whether they already have a ticket, use a concession or are only joining afterwards.",
      },
    ],
    invitationText: [
      "Hi everyone,",
      "who's up for [the cinema / the theatre / the opera / the museum]? 🎭",
      "When: [date], [time]",
      "Meeting point: [place]",
      "Please sign up here by [date] so I can get the right number of tickets: [Link]",
      "Best wishes,",
      "[Your name]",
    ],
    faq: [
      {
        question: "How early should you get to the theatre?",
        answer:
          "About 20 to 30 minutes before the start is a good guide, so there's time for the cloakroom and finding your seats. Put the meeting time on your event page, and guests note when they'll be there.",
      },
      {
        question: "Is a group ticket worth it?",
        answer:
          "Many theatres, museums and cinemas offer group rates from a certain number of people. The reply list shows you in time whether you'll reach the group size.",
      },
      {
        question: "Can I buy tickets through GASTZILLA?",
        answer:
          "No. GASTZILLA isn't a ticket shop – you only collect replies. You buy tickets from the cinema, theatre or organiser as usual.",
      },
      {
        question: "How do we find a date for the theatre or cinema?",
        answer:
          "Enter the possible performances as date options, for example two evenings with times. Everyone votes via the link, and you buy tickets for the date most people can make.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "rehearsal",
    name: "Rehearsals & gigs",
    title: "Band rehearsal, choir practice or gig – collect replies by link",
    metaTitle: "Band Rehearsals, Choir Practice & Gigs – GASTZILLA",
    description:
      "Band rehearsal, orchestra or choir practice, rehearsal weekend or gig: musicians reply via a link without an account – and you see who's in. Free.",
    teaser: "Band, orchestra or choir rehearsal, rehearsal weekend or gig – who's in and who's bringing what?",
    intro: [
      "Whether it's band practice in the rehearsal room, orchestra or choir practice, a rehearsal weekend or a gig at the town festival: for the session to be worth it, the right people need to be there. Is the bass missing, the second violin or half the sopranos? In the group chat you often only find out at the last minute.",
      "With GASTZILLA you create a page for the date in a few minutes and share the link. Everyone adds themselves – no account or app needed – and everyone can see who's coming.",
    ],
    benefitsTitle: "Why GASTZILLA works for rehearsals and gigs",
    benefits: [
      {
        title: "Is every part covered?",
        text: "Musicians note in their reply which instrument or voice part they're covering. So you see beforehand whether the line-up works.",
      },
      {
        title: "Gear and sheet music coordinated",
        text: "Amps, music stands, cables, sheet music or drinks – everyone notes what they're bringing. Then nothing's missing at set-up.",
      },
      {
        title: "Plan a rehearsal weekend",
        text: "For a rehearsal weekend you enter a date range. Everyone notes when they're arriving and, if they like, how long they're staying.",
      },
    ],
    invitationText: [
      "Hi everyone,",
      "next [band rehearsal / orchestra rehearsal / choir practice] on [date] at [time]! 🎵",
      "Where: [rehearsal room / place]",
      "Please sign up here and note which instrument or voice part you're covering: [Link]",
      "See you there!",
      "[Your name]",
    ],
    faq: [
      {
        question: "How long should a band rehearsal be?",
        answer:
          "Two to three hours is common – long enough to work on songs, short enough to stay focused. For more, plan a rehearsal weekend: with GASTZILLA you enter a date range and everyone notes when they're coming.",
      },
      {
        question: "Can I set up regular rehearsals?",
        answer:
          "Each date is a separate event on GASTZILLA. Your first event is free, and you'll soon be able to buy more. For a rehearsal weekend, one event with a date range is enough.",
      },
      {
        question: "How do I see who plays which instrument?",
        answer:
          "Ask musicians to add their instrument or voice part as a message when they reply. The message appears in the list right next to their entry.",
      },
      {
        question: "How do we find a rehearsal date that suits everyone?",
        answer:
          "Suggest up to four rehearsal dates. Everyone ticks what works – if someone important is missing, you see it immediately and fix the date when the line-up is complete.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "going-out",
    name: "Night out",
    title: "Restaurant, bar, club or escape room – plan a night out by link",
    metaTitle: "Plan a Group Dinner, Night Out or Escape Room – GASTZILLA",
    description:
      "Restaurant, bar, club, bowling or escape room: invite by link, everyone RSVPs without an account – and you know how many people to book for. Free.",
    teaser: "Restaurant, cocktail bar, local pub, club, bowling or escape room – see who's in.",
    intro: [
      "Going out for dinner, an evening at a cocktail bar, a round at your local, then on to a club – or a game of bowling, pool or darts, an escape room with friends: a night out is quickly suggested. But who's really coming, and how many people do you need to book a table, a lane or a room for?",
      "With GASTZILLA you create a page for your evening in a few minutes and share the link. Everyone adds themselves – no account or app needed – and you see straight away how many people to expect.",
    ],
    benefitsTitle: "Why GASTZILLA works for a night out",
    benefits: [
      {
        title: "Reserve and book for the right number",
        text: "Everyone signs up and names their companions. So you know how many people to book for at the restaurant, bowling alley or escape room – where the exact team size matters.",
      },
      {
        title: "Join later, leave earlier",
        text: "Guests say when they're arriving and, if they like, how long they're staying – handy when some only join for the club.",
      },
      {
        title: "Food preferences in advance",
        text: "Guests can leave a message – whether they're vegetarian, have an allergy or are only joining after dinner.",
      },
    ],
    invitationText: [
      "Hi everyone,",
      "who's up for [dinner out / a cocktail bar / the pub / a club / bowling / an escape room]? 🍸",
      "When: [date] from [time]",
      "Where: [place]",
      "Please sign up here by [date] so I can book for the right number: [Link]",
      "See you then!",
      "[Your name]",
    ],
    faq: [
      {
        question: "How many people do you need for an escape room?",
        answer:
          "Most escape rooms are designed for about two to six players – the provider gives the exact group size. The reply list shows you whether you need one team or two.",
      },
      {
        question: "How far in advance should I book for a group?",
        answer:
          "For restaurants and bars at the weekend, booking one to two weeks ahead is usually worth it; popular escape rooms can be booked up even earlier. So collect the replies in good time.",
      },
      {
        question: "Can I reserve a table or book an escape room through GASTZILLA?",
        answer:
          "No. GASTZILLA only collects replies. You make the booking with the restaurant, bar, bowling alley or escape room as usual – but with the right number of people.",
      },
      {
        question: "How do we find an evening when everyone's free?",
        answer:
          "Instead of going back and forth in the chat, suggest a few evenings and everyone ticks what works. Then you book for the favourite – with the right number of people.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "sports-together",
    name: "Sport together",
    title: "Play sport together – running, climbing, football and more by link",
    metaTitle: "Organise Group Sports: Running, Football & More – GASTZILLA",
    description:
      "Running group, climbing, five-a-side, hockey or a ski trip: invite by link, everyone replies without an account – and you see if enough people are in.",
    teaser: "Running group, climbing, five-a-side, hockey or off to the mountains – see whether enough people are coming.",
    intro: [
      "Whether it's marathon training as a group, climbing and bouldering at the wall, five-a-side in the park, basketball, handball or hockey practice – or heading to the mountains with snowboards and skis: before you can start, enough people need to be in. In the group chat that's often unclear until the last minute.",
      "With GASTZILLA you create a page for your session in a few minutes and share the link. Everyone adds themselves – no account or app needed – and everyone can see at a glance who's in.",
    ],
    benefitsTitle: "Why GASTZILLA works for sport together",
    benefits: [
      {
        title: "Are there enough of us?",
        text: "The list shows everyone with the link who's said yes. So you quickly see whether there are enough for two teams, the running group or a climbing rope team.",
      },
      {
        title: "Kit sorted",
        text: "Balls, rackets, bibs, rope or drinks – everyone notes what they're bringing. Then nobody's left standing without kit.",
      },
      {
        title: "Meeting point and start time",
        text: "Place and time are on the page. Anyone joining later or leaving early simply says so in their reply.",
      },
      {
        title: "Off to the mountains",
        text: "For a snowboard or ski weekend, enter a date range. Sort out car shares and rental kit by message right in the reply.",
      },
    ],
    invitationText: [
      "Hi everyone,",
      "who's in? [Running / climbing / five-a-side / hockey / snowboard weekend] on [date] at [time]! ⚽",
      "Meeting point: [place]",
      "Sign up here so we know if there are enough of us – and note who's bringing [the ball / kit / a car]: [Link]",
      "Sporty greetings,",
      "[Your name]",
    ],
    faq: [
      {
        question: "How many players do you need for five-a-side football?",
        answer:
          "Five per team, so ten players for a game – many groups also bring a sub or two. With the reply list you see beforehand whether you have enough, or whether someone's still missing.",
      },
      {
        question: "Can players drop out again?",
        answer:
          "Yes. Anyone who can't make it after all simply ticks “I can't make it” in their entry. You get an email about it.",
      },
      {
        question: "Can I set up several dates?",
        answer: "Each date is a separate event. The first is free, and you'll soon be able to buy more.",
      },
      {
        question: "How do we find a date when enough people can play?",
        answer:
          "Suggest two to four dates and let everyone vote. You see for each date how many can make it – and fix the one where enough players come together.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "tabletop-night",
    name: "Board games & tabletop",
    title: "Organise a board game or tabletop night by link",
    metaTitle: "Organise a Board Game or Tabletop Night – GASTZILLA",
    description:
      "Board game night, tabletop RPG or wargaming session: players RSVP via a link without an account and note which games they're bringing. Free & ad-free.",
    teaser: "Board games, tabletop RPGs or miniatures – who's playing and who's bringing which game?",
    intro: [
      "A good games night stands or falls with the group: some games need exactly four players, the RPG campaign needs the whole party. And then there's the question of who's bringing which game, which army or which snacks.",
      "With GASTZILLA you create a page for your board game, tabletop RPG or wargaming night in a few minutes and share the link. Everyone adds themselves – no account or app needed – and everyone can see who's in.",
    ],
    benefitsTitle: "Why GASTZILLA works for a board game night",
    benefits: [
      {
        title: "How many at the table?",
        text: "The list shows everyone with the link who's said yes. So you know in time whether there are enough for the big strategy game or whether you need two tables.",
      },
      {
        title: "Who's bringing which game?",
        text: "Games, expansions, miniatures or snacks – everyone notes what they're bringing. Everyone sees it, and nobody lugs along the same game.",
      },
      {
        title: "Wishes and arrangements",
        text: "Guests can leave a message – what they'd like to play, say, or whether their character sheet is still with the game master.",
      },
      {
        title: "Find a date for games night",
        text: "For the RPG group the whole party needs to be free. Suggest up to four evenings – everyone votes via the link, and the favourite becomes the fixed date.",
      },
    ],
    invitationText: [
      "Hi everyone,",
      "it's time for another games night! 🎲",
      "When: [date] from [time]",
      "Where: [place]",
      "Sign up here and note which games you're bringing or what you'd like to play: [Link]",
      "Until the next roll!",
      "[Your name]",
    ],
    faq: [
      {
        question: "What do you bring to a board game night?",
        answer:
          "Games you'd like to show others, plus snacks and drinks. With GASTZILLA everyone notes what they're bringing – so you don't end up with three copies of the same game on the table.",
      },
      {
        question: "How many people for a board game night?",
        answer:
          "Many board games are made for three to six players. If more come, play at two tables – the reply list shows you in time how many it will be.",
      },
      {
        question: "How do we agree on what to play?",
        answer:
          "Guests can leave a message with their reply – what they'd like to play, for example. So you see beforehand which games are in demand.",
      },
      {
        question: "Does it work for a tabletop RPG campaign?",
        answer:
          "Yes. The group signs up, and you sort out character sheets, snacks or who's arriving late by message.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "gaming-night",
    name: "Gaming & LAN party",
    title: "Organise a gaming night or LAN party by link",
    metaTitle: "Organise a Gaming Night or LAN Party – GASTZILLA",
    description:
      "Console night or LAN party: players RSVP via a link without an account and note who's bringing the console, controllers or snacks. Free & ad-free.",
    teaser: "Console night or LAN party – who's playing and who's bringing controllers and cables?",
    intro: [
      "Whether it's couch co-op, a Mario Kart tournament or a weekend LAN party: before you start, you need to know who's coming, who's bringing their PC and whether there are enough controllers. In the group chat, arrangements like that get lost quickly.",
      "With GASTZILLA you create a page for your gaming night or LAN party in a few minutes and share the link. Everyone adds themselves – no account or app needed – and you keep the overview.",
    ],
    benefitsTitle: "Why GASTZILLA works for a gaming night",
    benefits: [
      {
        title: "Hardware coordinated",
        text: "Console, controllers, monitor, network cables or snacks – everyone notes what they're bringing. So you won't be missing the fourth controller or the extension lead.",
      },
      {
        title: "Over a whole weekend too",
        text: "For a LAN party just enter a date range. Guests note when they're arriving and, if they like, how long they're staying.",
      },
      {
        title: "Who's playing?",
        text: "The list shows everyone with the link who's said yes – so you know which game has enough players.",
      },
      {
        title: "Find a date for the LAN party",
        text: "Suggest possible weekends and let everyone vote. Whoever said yes appears on the guest list as soon as you fix the date.",
      },
    ],
    invitationText: [
      "Hi everyone,",
      "[gaming night / LAN party] at mine! 🎮",
      "When: [date] from [time] (until [date / time])",
      "Where: [place]",
      "Sign up here and note who's bringing a console, controllers, a PC or cables: [Link]",
      "GG!",
      "[Your name]",
    ],
    faq: [
      {
        question: "How does a LAN party work?",
        answer:
          "Everyone brings their PC or console and connects to a shared network to play together – often for a whole day or weekend. With GASTZILLA you sort out beforehand who's coming and who's bringing the network switch, cables or power strips.",
      },
      {
        question: "How long do LAN parties last?",
        answer:
          "Anything from one evening to a whole weekend. With GASTZILLA you enter a date range, and guests note when they're arriving, how long they're staying and which hardware they're bringing.",
      },
      {
        question: "How do I make sure no controllers or cables are missing?",
        answer:
          "Everyone notes what they're bringing when they reply – console, controllers, PC, monitor or network cables. Everyone sees the list, and gaps show up straight away.",
      },
      {
        question: "Does it work for a Mario Kart tournament?",
        answer:
          "Yes. Everyone signs up, and you see beforehand how many are playing – so you can plan rounds and controllers.",
      },
    ],
    updated: UPDATED,
  },
  {
    id: "date-poll",
    name: "Find a date",
    title: "Find a date and invite – date poll by link",
    metaTitle: "Date Poll & Invitation in One Link – GASTZILLA",
    description:
      "Find a date together: up to 4 options, guests vote via a link without an account. Fix the date and tell everyone via WhatsApp & co.",
    teaser: "No date yet? Guests vote via the link on which date works – then they RSVP straight away.",
    intro: [
      "Before you can invite anyone, you often need a date first: when are most people free? In the group chat, the question about the right date quickly ends in dozens of messages – and in the end nobody knows who can make it when.",
      "With GASTZILLA you suggest two to four dates – with or without a time – and share the link. Your guests tick what works for them or choose “None of these work”, no account or app needed. You see straight away which date is ahead, fix it with one click, and everyone who voted appears directly as a yes or no in the guest list. Finally, you get a ready-made text to tell everyone the date via WhatsApp, email and more.",
    ],
    benefitsTitle: "Why a date poll with GASTZILLA is worth it",
    benefits: [
      {
        title: "Poll and invitation in one",
        text: "Find the date first, then collect RSVPs – via the same link. Nobody has to sign up again after the poll, and the date confirmation to share is ready to go.",
      },
      {
        title: "No account, no app",
        text: "Guests open the link, enter their name and tick the dates that work. Done.",
      },
      {
        title: "The favourite at a glance",
        text: "An overview shows who can make which date. The date with the most votes is highlighted.",
      },
      {
        title: "Stay flexible",
        text: "Missing a date? Add it later – the votes so far are kept. You get an email for every vote.",
      },
    ],
    invitationText: [
      "Hi everyone,",
      "I'd like to celebrate [occasion] with you – but when suits you best?",
      "Please vote here by [date] on which dates work for you: [Link]",
      "Once the date is fixed, you can sign up via the same link.",
      "[Your name]",
    ],
    faq: [
      {
        question: "How do I find a date that works for everyone?",
        answer:
          "Suggest two to four dates and send the link to everyone. Each person ticks what works. The date with the most votes is highlighted – you fix it, and the poll becomes the guest list.",
      },
      {
        question: "How do I tell everyone the date once it's fixed?",
        answer:
          "As soon as you fix the date, GASTZILLA suggests a text: that you've decided on this date together, with the date, place and link, and a request to complete their details in the guest list. Adjust the greeting and sign-off, then copy the text or share it directly via WhatsApp, email and more.",
      },
      {
        question: "Is the date poll free?",
        answer:
          "No, the date poll is a paid extra on GASTZILLA. Your first event with a fixed date is free – guest list, invitation text and sharing included.",
      },
      {
        question: "What happens when I fix the date?",
        answer:
          "The poll ends. Anyone who ticked the date appears as a yes in the guest list, everyone else as a no. Guests can then complete their entry as usual, adding companions or things to bring, for example.",
      },
    ],
    updated: UPDATED,
  },
];
