import { useState, useRef, useEffect } from "react";

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --green-deep: #0d2818; --green-mid: #1a4731; --green-bright: #2d7a4f;
      --green-light: #4caf78; --gold: #c8a84b; --gold-light: #e8c96a;
      --cream: #f5f0e8; --card-bg: rgba(255,255,255,0.07); --border: rgba(200,168,75,0.25);
    }
    body { font-family: 'DM Sans', sans-serif; background: var(--green-deep); color: var(--cream); overflow-x: hidden; }
    h1,h2,h3,h4 { font-family: 'Playfair Display', serif; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--green-deep); }
    ::-webkit-scrollbar-thumb { background: var(--green-bright); border-radius: 2px; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    .fade-up  { animation: fadeUp .35s ease both; }
    .fade-up2 { animation: fadeUp .35s .07s ease both; }
    .fade-up3 { animation: fadeUp .35s .14s ease both; }
    .btn-gold {
      background: linear-gradient(135deg, var(--gold), var(--gold-light));
      color: var(--green-deep); border: none; padding: 12px 28px; border-radius: 6px;
      font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 14px;
      cursor: pointer; transition: transform .15s, box-shadow .15s; width: 100%;
    }
    .btn-gold:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200,168,75,.4); }
    .btn-gold:disabled { opacity:.5; cursor:not-allowed; transform:none; }
    .btn-outline {
      background: transparent; color: var(--gold); border: 1px solid var(--gold);
      padding: 9px 22px; border-radius: 6px; font-family: 'DM Sans',sans-serif;
      font-weight: 500; font-size: 14px; cursor: pointer; transition: background .15s, color .15s;
    }
    .btn-outline:hover { background: var(--gold); color: var(--green-deep); }
    .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; }
    .coach-bubble {
      background: linear-gradient(135deg, var(--green-mid), var(--green-bright));
      border: 1px solid var(--border); border-radius: 16px 16px 16px 4px;
      padding: 20px 22px; font-size: 15px; line-height: 1.75;
    }
    .coach-bubble p { margin-bottom: 14px; }
    .coach-bubble p:last-child { margin-bottom: 0; }
    .coach-bubble .section-title { color: var(--gold-light); font-weight: 600; margin-bottom: 6px; font-size: 14px; letter-spacing: .3px; }
    .upload-zone {
      border: 2px dashed var(--border); border-radius: 12px; padding: 36px 20px;
      text-align: center; cursor: pointer; transition: border-color .2s, background .2s;
    }
    .upload-zone:hover { border-color: var(--gold); background: rgba(200,168,75,.04); }
    .lesson-row {
      display: flex; align-items: center; gap: 14px;
      background: var(--card-bg); border: 1px solid var(--border);
      border-radius: 10px; padding: 15px 16px; cursor: pointer;
      transition: transform .15s, border-color .15s;
    }
    .lesson-row:hover { transform: translateX(4px); border-color: var(--gold); }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .field-label { display: block; font-size: 12px; color: var(--gold); margin-bottom: 5px; font-weight: 600; }
    .field-input {
      background: rgba(255,255,255,.06); border: 1px solid var(--border); border-radius: 8px;
      color: var(--cream); font-family: 'DM Sans',sans-serif; font-size: 16px;
      padding: 10px 13px; width: 100%; outline: none; transition: border-color .2s;
    }
    .field-input:focus { border-color: var(--gold); }
    .field-input::placeholder { color: rgba(245,240,232,.28); }
    textarea.field-input { resize: vertical; }
    /* Prevent iOS auto-zoom on any input — requires font-size >= 16px */
    input, textarea, select { font-size: 16px !important; }
    input[type=file] { display: none; }
    .nav-label { display: block; }
    @media(max-width:580px) { .nav-label { display: none; } }
    @keyframes spin { to { transform:rotate(360deg); } }
    @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
    @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(200,168,75,.4); } 50% { box-shadow: 0 0 0 6px rgba(200,168,75,0); } }
    .spinner { width:20px; height:20px; border:2px solid rgba(200,168,75,.25); border-top-color:var(--gold); border-radius:50%; animation:spin .7s linear infinite; display:inline-block; }
  `}</style>
);

// ── Coach data ────────────────────────────────────────────────────────────────
// ── Speech ───────────────────────────────────────────────────────────────────
const VOICE_PROFILES = {
  mac: { rate: 0.88, pitch: 0.9,  volume: 1 },  // measured, authoritative
  leo: { rate: 1.0,  pitch: 1.0,  volume: 1 },  // clear, analytical
  bea: { rate: 1.05, pitch: 1.12, volume: 1 },  // warm, energetic
};

function cleanForSpeech(text) {
  return text
    .replace(/#{1,6}\s+/g, "")          // markdown headers
    .replace(/\*\*(.+?)\*\*/g, "$1")    // bold
    .replace(/\*(.+?)\*/g, "$1")        // italic
    .replace(/`(.+?)`/g, "$1")          // inline code
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // links
    .replace(/\n{2,}/g, ". ")           // paragraph breaks → pause
    .replace(/\n/g, " ")                // single newlines
    .replace(/—/g, ", ")                // em-dashes → pause
    .replace(/\s+/g, " ")
    .trim();
}

function speakText(text, coachId) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const profile = VOICE_PROFILES[coachId] || VOICE_PROFILES.mac;
  const utterance = new SpeechSynthesisUtterance(cleanForSpeech(text));
  utterance.rate   = profile.rate;
  utterance.pitch  = profile.pitch;
  utterance.volume = profile.volume;
  window.speechSynthesis.speak(utterance);
}

function stopSpeech() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function isSpeaking() {
  return window.speechSynthesis?.speaking || false;
}

const COACHES = [
  { id: "mac",   name: "Mac",   emoji: "🏌", style: "Old School Pro",  desc: "30 years on tour. No-nonsense fundamentals.", color: "#2d7a4f" },
  { id: "leo", name: "Leo", emoji: "⛳",  style: "Modern Coach",    desc: "Data-driven, biomechanics focused.",          color: "#4a6fa5" },
  { id: "bea", name: "Bea", emoji: "☀",  style: "Motivator",       desc: "Encouraging and fun. Great for beginners.",   color: "#c8763a" },
];

const DIFF_COLOR = { Beginner: "#4caf78", Intermediate: "#c8a84b", Advanced: "#e05c5c" };
const CATS = ["All", "Fundamentals", "Full Swing", "Short Game", "Putting", "Specialty", "Mental Game"];

// ── Pre-written lesson content (3 versions per lesson: mac, leo, sunny) ────
const LESSON_CONTENT = {
  mac: {
    grip: [
      { title: "The Foundation", body: "The grip is the only connection you have with the club — get this wrong and nothing else matters. I've seen too many golfers chase swing fixes when their problem was sitting right in their hands the whole time. Get this right first." },
      { title: "How to Do It", body: "Hold the club in the fingers of your left hand (for right-handers), not the palm. The handle runs diagonally from the first knuckle of your index finger to the base of your pinky. Close your hand — you should see two to two-and-a-half knuckles on the back of your hand. Your right hand covers the left thumb. Use an overlapping, interlocking, or ten-finger grip — overlapping is most common on tour." },
      { title: "Common Mistakes", body: "Gripping too tight is the number one error I see. A death grip kills clubhead speed and causes tension all the way up your arms. Aim for a pressure of about 5 out of 10. Also watch for the grip slipping into the palm — this restricts wrist hinge and costs you distance." },
      { title: "Drill", body: "Hold a club out in front of you with just your lead hand and let it hang. Grip it only tight enough that it doesn't drop. That's your pressure. Practice making half-swings focusing on maintaining that pressure throughout." },
      { title: "Pro Tip", body: "Check your grip every single log practice session. It's the easiest thing to let slip and the most important thing to keep dialed in." },
    ],
    address: [
      { title: "Why Setup Wins", body: "Ben Hogan said good golf begins with a good setup. I've been saying it for 30 years. If you're misaligned at address, you're fighting an uphill battle before you've even taken the club back." },
      { title: "The Setup", body: "Stand with feet shoulder-width apart for irons, slightly wider for driver. Ball position moves forward as club length increases — center of stance for short irons, just inside the lead heel for driver. Bend from the hips, not the waist. Your spine should be relatively straight. Knees slightly flexed. Weight balanced 50-50 or slightly favoring the lead foot." },
      { title: "Alignment", body: "Aim the clubface at the target first. Then align your feet, hips, and shoulders parallel to the target line — like railway tracks. Most amateurs aim right and don't know it. Use alignment sticks on the range." },
      { title: "Common Mistakes", body: "Standing too upright or too hunched over. Too much tension in the arms — let them hang naturally. Ball too far back in the stance causing pulls and chunks." },
      { title: "Drill", body: "On the range, lay two clubs on the ground — one along your toe line, one along the ball-target line. Hit 20 balls checking your alignment matches these guides." },
    ],
    backswing: [
      { title: "The Purpose", body: "The backswing isn't about getting the club into a pretty position — it's about loading energy you'll release through the ball. Keep that in mind and you'll stop overthinking it." },
      { title: "How It Works", body: "Start with a one-piece takeaway — club, hands, arms, and shoulders move together for the first 12 inches. Rotate your shoulders fully — aim for 90 degrees or as close as your flexibility allows. Your hips will naturally rotate about half that. Keep your left arm relatively straight (not rigid). The club should point roughly at the target at the top." },
      { title: "Common Mistakes", body: "Lifting the arms instead of rotating the torso — this creates a steep, over-the-top downswing. Swaying off the ball instead of rotating around your spine. Overswinging — the club going past parallel doesn't add power, it adds inconsistency." },
      { title: "Drill", body: "Cross your arms over your chest and practice rotating your shoulders 90 degrees while keeping your lower body relatively stable. Feel the coil. That's what you're after." },
      { title: "Pro Tip", body: "Think 'low and slow' for the first 18 inches of the takeaway. Rushing the backswing is one of the most common power killers I see." },
    ],
    transition: [
      { title: "The Magic Move", body: "The transition from backswing to downswing is where most amateurs lose their shot. The downswing should start from the ground up — not the hands and arms. Get this right and everything else falls into place." },
      { title: "How It Works", body: "As your backswing finishes, your lower body starts moving first. Your left hip begins to shift toward the target and rotate open. Your weight transfers from your trail foot to your lead foot. Your arms drop naturally into the slot — a shallower plane than the backswing. Your hips lead, your shoulders follow, your arms follow, the club follows." },
      { title: "Common Mistakes", body: "Starting the downswing with the hands and shoulders — this throws the club over the top and produces pulls and slices. Not completing the backswing before starting down — rushing ruins the sequence. Spinning the hips too early without lateral shift." },
      { title: "Drill", body: "The step drill: Swing to the top, then physically step your lead foot toward the target to start the downswing. This forces you to lead with the lower body. Hit 20 balls like this until the feeling is ingrained." },
      { title: "Pro Tip", body: "Pause at the top for a beat — literally. It forces you to stop rushing and feel the proper sequence begin." },
    ],
    impact: [
      { title: "The Moment of Truth", body: "Everything in the golf swing is designed to produce one thing: a solid impact position. The ball doesn't care what your backswing looked like — it only knows what happened in that split second." },
      { title: "What It Looks Like", body: "At impact: hips are open to the target (30-45 degrees), weight is predominantly on the lead foot (80%), hands are ahead of the clubhead (shaft leaning forward), and your head is still behind the ball. For irons, you're hitting down and through — taking a divot after the ball." },
      { title: "Common Mistakes", body: "Flipping the wrists at impact — the hands should lead the clubhead, not trail it. Early extension — standing up through impact ruins the arc. Hanging back on the trail foot, causing fat and thin shots." },
      { title: "Drill", body: "Place a tee 4 inches in front of your ball and try to clip it with your follow-through. This promotes a forward shaft lean and proper hit-down motion." },
      { title: "Pro Tip", body: "Think of the left wrist (for right-handers) being flat or bowed at impact — not cupped. Bowed equals power. Cupped equals flipped." },
    ],
    "chip-basic": [
      { title: "The Short Game Truth", body: "More shots are lost inside 50 yards than anywhere else on the course. A good chipping technique takes 20 minutes to learn and a lifetime to master. Start here." },
      { title: "Basic Technique", body: "Narrow your stance. Ball in the center or slightly back. Hands forward — shaft leaning toward the target. Weight 70% on your lead foot and keep it there throughout. It's mostly an arm swing with minimal wrist action. Think of it as a putting stroke with a lofted club. Accelerate through the ball — never decelerate." },
      { title: "Club Selection", body: "Start with a pitching wedge or 9-iron for basic chips. More green to work with = less lofted club. Tight lie near the green = lower loft. Rough or obstacle to carry = more loft." },
      { title: "Common Mistakes", body: "Scooping — trying to lift the ball. The loft of the club does that for you. Decelerating into the ball — commit to the shot. Too much wrist action, causing inconsistency." },
      { title: "Drill", body: "Drop 10 balls just off the green and chip them all to the same target. Count how many end up within 3 feet. Track your progress weekly." },
    ],
    "chip-bump": [
      { title: "The Bump and Run", body: "This is the old-school shot that gets forgotten in the age of lob wedges. When you've got room to run the ball, a bump and run is your most consistent option." },
      { title: "How to Play It", body: "Use a 7, 8, or 9-iron. Ball back in the stance. Hands well forward. Make a putting-style stroke — keep the wrists quiet, arms swing like a pendulum. The ball pops up slightly and rolls the rest of the way to the hole. Calculate roughly how much the ball will carry vs. roll for your chosen club." },
      { title: "When to Use It", body: "Firm greens with plenty of green between you and the hole. Links-style courses. Into the wind. Anytime you want to take risk out of the equation." },
      { title: "Common Mistakes", body: "Using too much loft when the shot calls for run. Trying to lift the ball instead of letting it roll. Poor distance control from inconsistent contact." },
      { title: "Pro Tip", body: "Watch where the ball lands on bump and runs and track how much it rolls. Every course and every day is different — adjust your landing spot accordingly." },
    ],
    flop: [
      { title: "When to Pull It Out", body: "The flop shot is a specialty weapon — not an everyday shot. Use it when you have a tight lie, need maximum height fast, and have no other option. Phil Mickelson made it famous. Most amateurs attempt it way too often." },
      { title: "How to Play It", body: "Open the clubface significantly first, then re-grip. Open your stance to match. The ball position moves forward. Make a full, aggressive swing along your body line — not the target line. The open face adds loft and the swing path creates a glancing blow that pops the ball up steeply. You need to accelerate fully — any hesitation and you'll chunk it." },
      { title: "Lie Requirements", body: "You need a decent lie for this shot. Tight lies off firm turf work. Deep rough can work but is less predictable. Never attempt a flop from a buried or hardpan lie." },
      { title: "Common Mistakes", body: "Not opening the face enough. Decelerating. Attempting it from a bad lie. Using it when a simpler shot would work better." },
      { title: "Drill", body: "Practice on a good lie in rough or fairway. Place a headcover 2 feet in front of the ball and try to carry it while landing softly. Start with short swings before going full." },
    ],
    putting: [
      { title: "Where Scores Are Made", body: "You'll hit driver maybe 14 times a round. You'll putt at least double that. The best ballstrikers in history have lost tournaments because they couldn't putt. This is worth your time." },
      { title: "The Setup", body: "Eyes directly over the ball or just inside it. Stance comfortable — usually narrower than full swing. Grip is personal but keep it light. The putter face must be square to the start line at impact — that's the non-negotiable." },
      { title: "The Stroke", body: "Pendulum motion — shoulders rock, hands quiet. The stroke is the same length back as through for consistent pace. The putter face stays square throughout. No wrist flicking." },
      { title: "Green Reading", body: "Read from behind the hole looking back to the ball. Find the high point and low point. Look for overall slope — the last 3 feet before the hole matter most as pace slows." },
      { title: "Common Mistakes", body: "Decelerating — always accelerate through the ball. Looking up too early. Gripping too tight. Ignoring pace in favor of line." },
      { title: "Drill", body: "Gate drill: Place two tees slightly wider than the putter head just in front of the ball. Stroke putts without touching either tee. This trains a square face and consistent path." },
    ],
    bunker: [
      { title: "Greenside Bunkers", body: "Most amateurs fear the bunker. Tour pros prefer it to thick rough. Once you understand the technique, you'll see why — it's actually one of the more forgiving shots in golf." },
      { title: "The Technique", body: "Open the clubface, then take your grip. Open your stance to match. Ball forward — off the lead heel. Enter the sand 2 inches behind the ball and exit 2 inches in front. You're hitting the sand, not the ball — the sand cushion propels the ball out. Make a full, aggressive swing. The sand will slow the club so don't hold back." },
      { title: "How Much Sand", body: "For a standard greenside bunker shot, imagine a dollar bill under the ball — you want to remove that entire bill plus the ball. Too thin = bladed shot over the green. Too fat = ball stays in the bunker." },
      { title: "Common Mistakes", body: "Trying to scoop the ball out. Decelerating. Not opening the face enough. Gripping too tight." },
      { title: "Drill", body: "Draw a line in the sand 2 inches behind where the ball would be. Practice hitting 2 inches behind that line consistently before adding the ball." },
    ],
    "bunker-plugged": [
      { title: "The Fried Egg", body: "A plugged lie — where the ball is half-buried in the sand — is one of the most feared shots in amateur golf. But once you understand that the technique is completely different from a normal bunker shot, it becomes much more manageable. The key mental shift: you are not splashing this ball out. You are digging it out." },
      { title: "The Setup", body: "Close the clubface — square it up or even hood it slightly. This is the opposite of a normal bunker shot. A closed face allows the leading edge to dig into the sand rather than bounce off it. Ball position moves to the center of your stance. Weight favors your lead foot — 60 to 70 percent. Hands slightly forward." },
      { title: "The Swing", body: "Make a steep, aggressive swing and drive the club straight down into the sand 1 to 2 inches behind the ball. There is no follow-through to speak of — the club buries in the sand and the ball pops out low and hot. Don't try to help it up. Commit to driving down and trust the physics. The ball will come out lower and with almost no backspin, so it will run significantly after landing — account for this in where you aim." },
      { title: "Common Mistakes", body: "Opening the face like a normal bunker shot — this causes the club to bounce and blade the ball across the green. Not being aggressive enough — hesitation leaves the ball in the bunker. Trying to follow through — let the sand stop the club naturally." },
      { title: "Managing Expectations", body: "A plugged lie is a difficult shot. Even tour pros are happy to get it on the green and two-putt from here. Your goal is not to hole it — your goal is to escape cleanly and minimize damage. Aim for the middle of the green and take your medicine." },
      { title: "Pro Tip", body: "If the ball is deeply buried with little sand above it, consider using a pitching wedge instead of a sand wedge. The sharper leading edge digs even more effectively than the wider sole of a sand wedge in severe plugged situations." },
    ],
    "bunker-hardpan": [
      { title: "When the Sand is Hard", body: "Firm, wet, or hardpan sand changes everything about the bunker shot. The bounce on your sand wedge — which is your best friend in soft sand — becomes your worst enemy on hard sand. It causes the club to skip off the surface and blade the ball. You need a completely different approach." },
      { title: "Reading the Sand", body: "Before you step in, look at the surface. Soft sand is light and fluffy — your foot sinks in easily. Firm sand feels more compact — your foot barely leaves a print. Hardpan or wet sand may look almost like dirt. The firmer the surface, the more you need to adjust." },
      { title: "The Technique", body: "Use less bounce — switch to a pitching wedge, gap wedge, or a sand wedge with low bounce if you have one. Open the face less than normal or keep it square. The swing is shallower — you're almost picking the ball off the surface rather than splashing through sand. Think of it more like a chip shot from a tight lie than a traditional bunker shot. Take a thin sliver of sand or even contact the ball first on very firm surfaces." },
      { title: "Ball Position and Entry", body: "Ball position moves slightly back from your normal bunker position. Enter the sand closer to the ball — even half an inch behind it on extremely firm surfaces. The less sand you take, the better on hard ground. A normal bunker shot entry 2 inches behind the ball will either bounce off the hard surface or result in a fat, heavy shot." },
      { title: "Common Mistakes", body: "Using a wide-soled sand wedge with lots of bounce — it will skip off the hard surface. Trying to take the same amount of sand as a soft bunker shot. Decelerating from fear — commit to the shot." },
      { title: "Pro Tip", body: "If you're on a links course or playing after heavy rain has packed the bunkers, check every bunker you're in before committing to your technique. Conditions change throughout a round. A bunker that played soft on the front nine may be firm after the sun has dried it by the back nine." },
    ],
    "bunker-spin": [
      { title: "The Shot That Impresses Everyone", body: "The high-spinning bunker shot that lands soft and checks up is the one you see tour pros hit on TV. It's not a trick — it's the result of specific technique applied to the right conditions. The good news: it's very learnable. The bad news: it requires the right lie and the right sand. You can't spin a plugged ball, and you can't spin out of wet, heavy sand." },
      { title: "When You Can Use It", body: "You need a good lie — ball sitting cleanly on top of the sand. You need decent sand depth — at least 3 to 4 inches. You need a lofted wedge with plenty of grooves. A modern 58 or 60 degree wedge with sharp grooves in dry sand is your best tool." },
      { title: "The Technique", body: "Open the face as much as you're comfortable with — more than a standard bunker shot. Open your stance to match. Grip pressure stays light. The key is swing speed combined with a thin entry point — you want to slide the club under the ball, taking only about an inch of sand rather than the normal 2 inches. The faster you swing with a thinner sand entry and more face loft, the more spin you generate. Accelerate hard through the ball — this is not the time to be tentative." },
      { title: "The Entry Point", body: "Move your entry point slightly closer to the ball compared to a standard bunker shot. Instead of 2 inches behind the ball, aim for 1 to 1.5 inches. This shallower, thinner cut of sand maximizes the club-to-ball contact and spin transfer. Think of skimming the sand rather than splashing through it." },
      { title: "Common Mistakes", body: "Trying to add spin from rough or plugged lies — it won't work and you'll lose control. Not swinging fast enough — spin requires speed. Decelerating through impact. Using a wedge with worn grooves — grooves are everything for spin in sand." },
      { title: "Pro Tip", body: "Practice this shot with a specific target — not just the green. Pick a spot and try to land the ball there and check up to a second spot. Learning to control both the carry distance and the check-up distance is what separates good bunker players from great ones." },
    ],
    "fairway-bunker": [
      { title: "A Different Animal", body: "The fairway bunker is completely different from the greenside bunker. Here you want to pick the ball clean — not splash through sand. Distance is the goal, not height." },
      { title: "The Technique", body: "Take one or two clubs more than normal to compensate for restricted swing and firm stance. Grip down an inch. Plant your feet firmly. Ball position slightly back from normal. The key: pick the ball cleanly off the sand. Focus on the top of the ball, not behind it. Make a controlled, three-quarter swing — this is not the time for a full rip." },
      { title: "Club Selection", body: "Check the lip height first. If the lip is significant, take enough loft to clear it — being safe trumps distance every time. A bogey from a fairway bunker is fine. A buried ball in the face of the bunker is not." },
      { title: "Common Mistakes", body: "Using too little loft and hitting the lip. Trying to swing too hard and losing balance on soft sand. Taking too much sand by playing the ball too far forward." },
      { title: "Pro Tip", body: "Choke down on the grip. This shortens the effective length of the club and reduces the chance of hitting fat." },
    ],
    uphill: [
      { title: "Uneven Lies", body: "Golf courses aren't flat. As soon as you step off the tee, you're dealing with slopes. Knowing how to adjust takes strokes off your card." },
      { title: "Uphill Lies", body: "The slope adds effective loft — the ball will fly higher and shorter. Take one or two more clubs than normal. Align your shoulders to the slope. Ball slightly forward. Swing along the slope — follow the hill with your finish. The tendency is to push the shot right, so aim slightly left." },
      { title: "Downhill Lies", body: "The slope reduces effective loft — the ball flies lower and can run. Take one less club. Lean into the slope — more weight on the lead foot. Ball slightly back in the stance. Swing along the slope downward. The tendency is to pull left — aim slightly right." },
      { title: "Sidehill Lies — Ball Above Feet", body: "The ball will tend to go left. Grip down on the club. Stand taller. Aim right of the target to compensate. Make a flatter swing." },
      { title: "Sidehill Lies — Ball Below Feet", body: "The ball will tend to go right. Grip at the full end of the club. Flex the knees more. Aim left of target. Swing more upright." },
    ],
    grain: [
      { title: "What is Grain?", body: "Grain is the direction the grass grows. It matters most on Bermuda grass greens found in warm climates. Ignore grain and your putts will break differently than you expect." },
      { title: "Reading It", body: "With the grain — the grass looks shiny and light. The putt will be faster and break less. Against the grain — the grass looks dull and dark. The putt will be slower and break more. Grass generally grows toward the setting sun and toward water sources." },
      { title: "Sidehill Putts and Grain", body: "If the break and the grain agree — exaggerate your read. If the grain runs opposite to the break — the putt will hold its line more than the slope suggests. This is the hardest read in golf." },
      { title: "Bermuda vs. Bentgrass", body: "Bent greens (common in cooler climates) have less noticeable grain. Bermuda grain is significant — sometimes dramatically so on short putts. Always check the grass type before your round." },
      { title: "Pro Tip", body: "Look at the hole itself. The side where the cup looks ragged or worn away is typically downgrain. The clean-cut side is into the grain." },
    ],
    wind: [
      { title: "Play the Wind, Don't Fight It", body: "Wind is part of the game. The best players use it as a weapon. The worst players let it rattle them. Learn to love windy days — most amateurs don't prepare for them and that means you have an edge." },
      { title: "Into the Wind", body: "Take more club — sometimes significantly more depending on strength. Grip down for control. Ball slightly back in the stance. Three-quarter swing with a lower finish. The old caddy rule: 'Into the wind, don't be thin.' The ball will check up less, so account for run." },
      { title: "Downwind", body: "Take less club. The ball carries farther and runs more. High shots can balloon — keep the ball lower. Full swing but let the wind do the work." },
      { title: "Crosswind", body: "Two options: aim into the wind and let it straighten the ball, or aim at the target and let the wind move it. For less skilled players, aiming into the wind and releasing it is safer. Always account for run on the downwind side." },
      { title: "Pro Tip", body: "Watch the tops of the trees, not the grass at your feet. The wind at ball height is what matters, and that's often much stronger than what you feel on the ground." },
    ],
    driver: [
      { title: "Why the Driver is Different", body: "Every other club in the bag is designed to hit down on the ball — the driver is the only one you hit up on. That one difference changes everything about the setup and swing. Get it wrong and you'll be spraying drives all day. Get it right and it's the most satisfying shot in golf." },
      { title: "The Setup", body: "Tee the ball high — half the ball should sit above the top of the clubface at address. Ball position moves well forward, off the inside of your lead heel. Widen your stance slightly beyond shoulder width for stability. Your spine should tilt away from the target — feel like your trail shoulder is lower than your lead. This tilt is what allows you to swing up through the ball." },
      { title: "The Swing", body: "The driver swing is your widest, most sweeping motion. Take it back low and wide — resist the urge to pick it up. Make a full shoulder turn, 90 degrees or as close as flexibility allows. On the downswing, feel like you're hitting up and through — the bottom of your arc should be behind the ball, not at it. Finish high and full, weight fully on the lead foot." },
      { title: "Tee Height Matters", body: "Most amateurs tee the ball too low. A higher tee promotes the upward angle of attack that launches the ball high with low spin — the combination that gives you maximum distance. If you're hitting down on your driver and getting a low bullet, your tee is too low or your ball position is too far back." },
      { title: "Common Mistakes", body: "Trying to kill it — tension and aggression destroy timing and clubhead speed. Hanging back on the trail foot trying to 'lift' the ball. Swaying instead of rotating. Overswinging past parallel and losing control. Remember: smooth is far. Some of the longest hitters on tour look almost casual through impact." },
      { title: "Drill", body: "Tee up a ball and practice making three-quarter driver swings focusing entirely on balance. Start slow, finish high, hold the finish for 3 seconds. If you can't hold the finish, you swung too hard. Build up to full speed only once the three-quarter swing feels solid and balanced." },
      { title: "Pro Tip", body: "Pick a specific target — not just 'the fairway.' Find a tree, a bunker edge, a spot in the distance. Vague targets produce vague shots. The tighter your target, the better your brain aims the swing." },
    ],
    routine: [
      { title: "Why a Routine Matters", body: "Every tour professional uses a pre-shot routine. It's not superstition — it's a way to standardize preparation, manage nerves, and trigger a clear, committed swing. Amateurs who have one shoot lower scores. Period." },
      { title: "The Components", body: "1. Read the shot — assess yardage, lie, wind, slope, and decide on your shot shape and target. 2. Pick a specific intermediate target — a spot 3 feet in front of the ball on your line. 3. One or two practice swings with intent — feel the shot you're about to hit. 4. Step into address, align to the intermediate target. 5. One trigger — a forward press, a breath, a look at the target — and go." },
      { title: "Wind and Slope", body: "Assess wind direction and strength from multiple height references. Calculate slope effect — for every 10 feet of elevation change, add or subtract roughly one club. On approach shots, decide on your landing zone, not just a direction." },
      { title: "Consistency is the Goal", body: "The same routine every single time — in practice AND on the course. When you feel nervous, lean on the routine. It gives your brain something familiar to anchor to." },
      { title: "Pro Tip", body: "Time yourself. Most tour pros complete their routine in under 30 seconds from stepping behind the ball to pulling the trigger. Longer than that and you're thinking too much." },
    ],
  },
  leo: {},
  bea: {},
};

// Leo and Bea versions share the same structure — generate from Mac's with different intro voice
["leo","bea"].forEach(coachId => {
  Object.keys(LESSON_CONTENT.mac).forEach(lessonId => {
    LESSON_CONTENT[coachId][lessonId] = LESSON_CONTENT.mac[lessonId].map(section => ({
      ...section,
      body: section.body, // same content, coach voice applied via intro
    }));
  });
});

const COACH_INTROS = {
  mac:   (lesson) => `Alright, let's talk about ${lesson.title.toLowerCase()}. No fluff, just what works.`,
  leo: (lesson) => `Let's break down ${lesson.title.toLowerCase()} using what the data and biomechanics research actually tells us.`,
  bea: (lesson) => `Great choice picking ${lesson.title.toLowerCase()} — this is going to make a real difference in your game! Let's dive in.`,
};

// ── Lessons ───────────────────────────────────────────────────────────────────
const LESSONS = [
  { id: "grip",           title: "The Proper Grip",           icon: "🤝", cat: "Fundamentals", diff: "Beginner",
    angle: "face-on",
    angleReason: "Face-on shows your hand position, knuckle count, and grip pressure clearly.",
    drill: "grip drill — hold the club in your fingers with a relaxed pressure and make 10 slow half-swings, focusing on keeping your grip pressure consistent throughout" },
  { id: "address",        title: "Ball Address & Setup",       icon: "🎯", cat: "Fundamentals", diff: "Beginner",
    angle: "both",
    angleReason: "Face-on checks alignment and ball position. Down the line shows spine angle and posture.",
    drill: "setup and alignment drill — place two alignment sticks on the ground (one for ball-target line, one for toe line) and hit 10 shots checking your stance, ball position, and posture each time" },
  { id: "backswing",      title: "The Backswing",              icon: "↗", cat: "Full Swing",   diff: "Beginner",
    angle: "down the line",
    angleReason: "Down the line best shows club plane, arm position, and shoulder turn depth.",
    drill: "one-piece takeaway drill — make slow-motion backswings keeping the club, hands, arms and shoulders moving together for the first 18 inches, pausing at waist height to check position" },
  { id: "transition",     title: "Transition & Downswing",     icon: "🔄", cat: "Full Swing",   diff: "Intermediate",
    angle: "down the line",
    angleReason: "Down the line reveals whether the club is dropping into the slot or coming over the top.",
    drill: "step drill for transition — swing to the top then physically step your lead foot toward the target to start the downswing, forcing lower body to lead. Hit 15 balls this way" },
  { id: "impact",         title: "Impact Position",            icon: "💥", cat: "Full Swing",   diff: "Intermediate",
    angle: "face-on",
    angleReason: "Face-on clearly shows shaft lean, weight transfer, and hip position at impact.",
    drill: "impact bag or towel drill — place a rolled towel or impact bag where the ball would be and practice driving your hands forward through impact with shaft lean. Focus on lead wrist being flat at contact" },
  { id: "chip-basic",     title: "Chipping: Basic Technique",  icon: "📐", cat: "Short Game",   diff: "Beginner",
    angle: "face-on",
    angleReason: "Face-on shows shaft lean, weight position, and whether you're scooping or staying ahead.",
    drill: "clock drill — imagine a clock face around the hole. Chip 10 balls to the 3 o'clock position, then 6, then 9, then 12, controlling distance each time" },
  { id: "chip-bump",      title: "Chipping: Bump & Run",       icon: "🏃", cat: "Short Game",   diff: "Beginner",
    angle: "face-on",
    angleReason: "Face-on best shows the quiet wrist action and forward lean essential for a bump and run.",
    drill: "bump and run landing spot drill — pick a specific landing spot 2 feet onto the green and try to land 10 consecutive chips on that exact spot using a 7 or 8 iron" },
  { id: "flop",           title: "The Flop Shot",              icon: "🚀", cat: "Short Game",   diff: "Advanced",
    angle: "face-on",
    angleReason: "Face-on shows the open face, stance angle, and whether you're committing through the shot.",
    drill: "headcover flop drill — place a headcover 2 feet in front of the ball and practice flop shots that carry over it while landing softly. Start with small swings before going full" },
  { id: "putting",        title: "Putting Fundamentals",       icon: "🎱", cat: "Putting",      diff: "Beginner",
    angle: "face-on",
    angleReason: "Face-on shows eye position over the ball, stroke path, and whether the face is square at impact.",
    drill: "gate drill — place two tees just wider than the putter head a few inches in front of the ball. Stroke 20 putts without touching either tee, training a square face and consistent path" },
  { id: "bunker",         title: "Bunker Play: Greenside",     icon: "🏖", cat: "Short Game",   diff: "Intermediate",
    angle: "face-on",
    angleReason: "Face-on shows the open stance, sand entry point, and follow-through clearly.",
    drill: "line in the sand drill — draw a line in the sand 2 inches behind where the ball would be. Practice hitting 2 inches behind the line consistently, splashing sand onto the green, before adding the ball" },
  { id: "bunker-plugged",  title: "Bunker: Plugged Lie",       icon: "😬", cat: "Short Game",   diff: "Advanced",
    angle: "face-on",
    angleReason: "Face-on best shows the steep downward dig and closed face position needed for a plugged lie.",
    drill: "plugged lie bunker drill — bury a ball halfway into the sand yourself and practice the closed-face dig technique. Focus on driving the club straight down into the sand behind the ball and accepting the lower, running result" },
  { id: "bunker-hardpan", title: "Bunker: Firm Sand & Hardpan", icon: "🪨", cat: "Short Game",   diff: "Advanced",
    angle: "down the line",
    angleReason: "Down the line shows the shallow swing path and thin sand entry critical for hard surfaces.",
    drill: "firm sand contact drill — find the firmest part of a practice bunker or simulate with a tight lie. Practice making a shallower, more controlled entry into the sand, taking less sand than a normal bunker shot. Focus on clean, consistent contact" },
  { id: "bunker-spin",    title: "Bunker: High Spin Stop Shot", icon: "🎯", cat: "Short Game",   diff: "Advanced",
    angle: "face-on",
    angleReason: "Face-on shows the open face, fast swing speed, and thin cut of sand needed to generate spin.",
    drill: "spin and check drill — from a good lie in a practice bunker, hit 10 shots focusing on maximum face openness, fast swing speed, and a thin cut of sand. Watch how quickly the ball checks up and adjust your sand entry point" },
  { id: "fairway-bunker", title: "Bunker Play: Fairway",       icon: "⛱", cat: "Short Game",   diff: "Advanced",
    angle: "down the line",
    angleReason: "Down the line shows the shallow, controlled swing plane and clean ball-first contact.",
    drill: "clean contact fairway bunker drill — grip down one inch, choke the club, and practice picking the ball cleanly off the sand with a three-quarter controlled swing. Focus on striking the ball first, not the sand" },
  { id: "uphill",         title: "Uphill & Downhill Lies",     icon: "⛰", cat: "Specialty",    diff: "Intermediate",
    angle: "face-on",
    angleReason: "Face-on shows shoulder tilt matching the slope and weight distribution on uneven lies.",
    drill: "slope adaptation drill — find a sloped area of the practice area or course and hit 5 balls from an uphill lie, 5 from downhill, and 5 from each sidehill position, noting how each shot curves and adjusting aim" },
  { id: "grain",          title: "Reading Grain on Greens",    icon: "🌱", cat: "Putting",      diff: "Intermediate",
    angle: "face-on",
    angleReason: "Face-on shows your stroke path and whether grain is affecting your putter face at impact.",
    drill: "grain reading drill — before your next round, read the grain on every practice green putt. Look at the shiny vs. dull grass and predict whether the putt will be faster or slower, then verify against the actual roll" },
  { id: "wind",           title: "Playing in the Wind",        icon: "💨", cat: "Specialty",    diff: "Intermediate",
    angle: "down the line",
    angleReason: "Down the line best shows the three-quarter swing, low finish, and flatter trajectory into the wind.",
    drill: "into-the-wind trajectory drill — hit 10 shots into the wind using one extra club and a three-quarter swing with a low finish. Compare trajectory and distance to your normal shot and calibrate your club selection" },
  { id: "driver",         title: "Driving the Ball",           icon: "🏌", cat: "Full Swing",   diff: "Intermediate",
    angle: "both",
    angleReason: "Down the line shows the sweeping upward swing path. Face-on shows the spine tilt and weight transfer away from the target.",
    drill: "driver tee height and sweep drill — tee the ball so half of it sits above the clubface, then practice making sweeping driver swings focused on hitting up on the ball at impact. Hit 15 drives focusing on a smooth, full finish rather than swinging hard" },
  { id: "routine",        title: "Pre-Shot Routine",           icon: "🧘", cat: "Mental Game",  diff: "Beginner",
    angle: "face-on",
    angleReason: "Face-on captures your full routine from behind the ball through address and swing.",
    drill: "routine timing drill — on the range, build a consistent pre-shot routine and time yourself with your phone. Aim to complete the full routine in under 30 seconds from stepping behind the ball to starting the swing. Repeat 20 times until it's automatic" },
];

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function askClaude({ system, messages, max_tokens = 1500 }) {
  const response = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens,
      system,
      messages,
    }),
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
  if (!text) throw new Error("Empty response");
  return text;
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function Nav({ active, setActive, coach, audioEnabled, setAudioEnabled, profile, onProfileClick }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const menuItems = [
    { id: "home",      icon: "🏠", label: "Home" },
    { id: "profile",   icon: "👤", label: "My Profile" },
    { id: "plan",      icon: "📋", label: "My Goals" },
    { id: "mybag",     icon: "🏌", label: "My Bag" },
    { id: "range",     icon: "🎯", label: "Log Practice Session" },
    { id: "analytics", icon: "📈", label: "Game Analytics" },
    { id: "score",     icon: "📊", label: "Scorecard" },
    { id: "caddy",     icon: "🧍", label: "On-Course Caddy" },
    { id: "lessons",   icon: "📚", label: "Lessons" },
    { id: "swing",     icon: "🏌", label: "Swing Analyzer" },
    { id: "drills",    icon: "🎪", label: "Drill Library" },
    { id: "mental",    icon: "🧠", label: "Mental Game" },
    { id: "history",   icon: "🕐", label: "History" },
    { id: "help",      icon: "❓", label: "Help & Feedback" },
  ];

  function go(id) { setActive(id); setMenuOpen(false); }

  // Current page label for breadcrumb
  const currentLabel = menuItems.find(m => m.id === active)?.label
    || (active === "profile" ? "My Profile" : "");

  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(13,40,24,.96)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px", height: 58,
      }}>
        {/* Left: avatar + logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Profile avatar — prominent on left */}
          <button onClick={onProfileClick} style={{
            background: profile?.name
              ? "linear-gradient(135deg, var(--green-bright), var(--green-mid))"
              : "rgba(255,255,255,.08)",
            border: `2px solid ${profile?.name ? "var(--gold)" : "var(--border)"}`,
            borderRadius: "50%", width: 36, height: 36,
            cursor: "pointer", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: profile?.name ? 15 : 16, fontWeight: 800, color: "var(--gold)",
            transition: "all .2s",
          }}>
            {profile?.name ? profile.name.charAt(0).toUpperCase() : "👤"}
          </button>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, color: "var(--gold)", lineHeight: 1.1 }}>Scratch</div>
            {currentLabel && (
              <div style={{ fontSize: 9, color: "rgba(245,240,232,.35)", letterSpacing: ".3px", textTransform: "uppercase", marginTop: 1 }}>{currentLabel}</div>
            )}
          </div>
        </div>

        {/* Right: audio + hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => { setAudioEnabled(a => !a); if (audioEnabled) stopSpeech(); }}
            style={{
              background: audioEnabled ? "rgba(76,175,120,.2)" : "transparent",
              border: `1px solid ${audioEnabled ? "rgba(76,175,120,.5)" : "var(--border)"}`,
              borderRadius: 20, padding: "5px 10px", cursor: "pointer",
              fontSize: 15, lineHeight: 1, transition: "all .2s",
            }}>
            {audioEnabled ? "🔊" : "🔇"}
          </button>
          <button
            onClick={() => setMenuOpen(m => !m)}
            style={{
              background: menuOpen ? "rgba(200,168,75,.14)" : "transparent",
              border: `1px solid ${menuOpen ? "var(--gold)" : "var(--border)"}`,
              borderRadius: 8, padding: "7px 10px", cursor: "pointer",
              display: "flex", flexDirection: "column", gap: 4,
              transition: "all .2s",
            }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 18, height: 2, borderRadius: 2,
                background: menuOpen ? "var(--gold)" : "rgba(245,240,232,.7)",
                transition: "all .2s",
                transform: menuOpen
                  ? i === 0 ? "rotate(45deg) translate(4px, 4px)"
                  : i === 1 ? "scaleX(0)"
                  : "rotate(-45deg) translate(4px, -4px)"
                  : "none",
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Dropdown menu */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div onClick={() => setMenuOpen(false)} style={{
            position: "fixed", inset: 0, zIndex: 98,
            background: "rgba(0,0,0,.4)", backdropFilter: "blur(2px)",
          }} />
          {/* Menu panel */}
          <div style={{
            position: "fixed", top: 58, right: 0, zIndex: 99,
            width: 260, background: "rgba(13,40,24,.98)",
            borderLeft: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
            borderBottomLeftRadius: 16,
            boxShadow: "-4px 4px 24px rgba(0,0,0,.5)",
            animation: "slideDown .15s ease-out",
            maxHeight: "calc(100vh - 58px)",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
            onTouchMove={e => e.stopPropagation()}
          >
            {/* Coach badge inside menu */}
            <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>{coach.emoji}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)" }}>{coach.name}</div>
                <div style={{ fontSize: 10, color: "rgba(245,240,232,.35)" }}>{coach.style}</div>
              </div>
            </div>
            {menuItems.map((item, i) => (
              <button key={item.id} onClick={() => go(item.id)} style={{
                width: "100%", padding: "13px 18px", background: active === item.id ? "rgba(200,168,75,.12)" : "transparent",
                border: "none", borderBottom: i < menuItems.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
                color: active === item.id ? "var(--gold)" : "rgba(245,240,232,.8)",
                textAlign: "left", cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans',sans-serif",
                fontWeight: active === item.id ? 700 : 400,
                display: "flex", alignItems: "center", gap: 12,
                transition: "background .1s",
              }}>
                <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{item.icon}</span>
                {item.label}
                {active === item.id && <span style={{ marginLeft: "auto", color: "var(--gold)", fontSize: 10 }}>●</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}


// ── Home ──────────────────────────────────────────────────────────────────────
function Home({ coach, setCoach, go, profile }) {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 20px" }}>
      <div className="fade-up" style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{ fontSize: 52, marginBottom: 10 }}>⛳</div>
        <h1 style={{ fontSize: 50, fontWeight: 900, color: "var(--gold)", letterSpacing: "-1px", lineHeight: 1 }}>Scratch</h1>
        {profile?.name ? (
          <p style={{ color: "rgba(245,240,232,.7)", marginTop: 10, fontSize: 16 }}>
            Welcome back, <strong style={{ color: "var(--gold)" }}>{profile.name}</strong>
            {profile.goal ? ` · Goal: ${profile.goal}` : ""}
          </p>
        ) : (
          <p style={{ color: "rgba(245,240,232,.55)", marginTop: 12, fontSize: 15 }}>Your AI golf coach — play like a scratch golfer</p>
        )}
      </div>
      <h2 className="fade-up2" style={{ color: "var(--gold)", fontSize: 20, marginBottom: 16, textAlign: "center" }}>Choose Your Coach</h2>
      <div className="fade-up2" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 36 }}>
        {COACHES.map(c => (
          <button key={c.id} onClick={() => setCoach(c)} style={{
            background: coach.id === c.id ? `linear-gradient(135deg,${c.color}50,${c.color}20)` : "var(--card-bg)",
            border: coach.id === c.id ? `2px solid ${c.color}` : "1px solid var(--border)",
            borderRadius: 12, padding: "18px 12px", cursor: "pointer",
            textAlign: "center", color: "var(--cream)", transition: "all .2s",
          }}>
            <div style={{ fontSize: 32, marginBottom: 7 }}>{c.emoji}</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: "var(--gold)" }}>{c.name}</div>
            <div style={{ fontSize: 11, color: "rgba(245,240,232,.45)", marginTop: 3 }}>{c.style}</div>
            <div style={{ fontSize: 12, color: "rgba(245,240,232,.65)", marginTop: 7, lineHeight: 1.4 }}>{c.desc}</div>
          </button>
        ))}
      </div>
      <h2 className="fade-up3" style={{ color: "var(--gold)", fontSize: 20, marginBottom: 16, textAlign: "center" }}>Toolkit</h2>
      <div className="fade-up3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[
          { icon: "📋", title: "My Goals",      desc: "Personalized coaching plan built for you",      id: "plan"      },
          { icon: "🏌", title: "My Bag",            desc: "Your clubs and calculated carry distances",      id: "mybag"     },
          { icon: "🎯", title: "Log Practice Session",     desc: "Log Trackman or launch monitor data",            id: "range"     },
          { icon: "📈", title: "Game Analytics",     desc: "Handicap, trends and performance stats",         id: "analytics" },
          { icon: "📊", title: "Scorecard",         desc: "Track scores, stats and round history",          id: "score"     },
          { icon: "🧍", title: "On-Course Caddy",   desc: "Real-time shot advice during a round",           id: "caddy"     },
          { icon: "📚", title: "Lessons",           desc: "19 lessons on every part of the game",           id: "lessons"   },
          { icon: "🏌", title: "Swing Analyzer",    desc: "Upload a photo of your swing for coach feedback",           id: "swing"     },
          { icon: "🎪", title: "Drill Library",     desc: "87 targeted drills for every part of the game",  id: "drills"    },
          { icon: "🧠", title: "Mental Game",       desc: "The inner game — think like a pro",              id: "mental"    },
          { icon: "🕐", title: "History",           desc: "Past sessions and coach notes",                  id: "history"   },
        ].map(f => (
          <button key={f.id} onClick={() => go(f.id)} className="card" style={{
            padding: "20px 18px", cursor: "pointer", textAlign: "left",
            color: "var(--cream)", border: "1px solid var(--border)", transition: "transform .15s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            <div style={{ fontSize: 26, marginBottom: 9 }}>{f.icon}</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: "var(--gold)", marginBottom: 5 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: "rgba(245,240,232,.55)", lineHeight: 1.5 }}>{f.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Lessons ───────────────────────────────────────────────────────────────────
function Lessons({ coach, addHistory, goSwing }) {
  const [open, setOpen] = useState(null);
  const [filter, setFilter] = useState("All");

  function openLesson(lesson) {
    setOpen(lesson);
    window.scrollTo({ top: 0, behavior: "instant" });
    addHistory({ type: "lesson", title: lesson.title, coach: coach.name, date: new Date().toLocaleDateString(), preview: `Lesson on ${lesson.title} with ${coach.name}.` });
  }

  const visible = filter === "All" ? LESSONS : LESSONS.filter(l => l.cat === filter);
  const sections = open ? (LESSON_CONTENT[coach.id]?.[open.id] || LESSON_CONTENT.mac[open.id] || []) : [];

  if (open) return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "30px 20px" }} className="fade-up">
      <button className="btn-outline" onClick={() => setOpen(null)} style={{ marginBottom: 22 }}>← Back</button>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <span style={{ fontSize: 34 }}>{open.icon}</span>
        <div>
          <h2 style={{ color: "var(--gold)", fontSize: 24 }}>{open.title}</h2>
          <div style={{ display: "flex", gap: 7, marginTop: 6 }}>
            <span className="badge" style={{ background: "rgba(45,122,79,.3)", color: "var(--green-light)", border: "1px solid var(--green-bright)" }}>{open.cat}</span>
            <span className="badge" style={{ background: "rgba(200,168,75,.12)", color: DIFF_COLOR[open.diff], border: "1px solid var(--border)" }}>{open.diff}</span>
          </div>
        </div>
      </div>

      {/* 1. Coach lesson content */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 26 }}>{coach.emoji}</span>
        <span style={{ color: "var(--gold)", fontWeight: 600 }}>{coach.name} says:</span>
      </div>
      <div className="coach-bubble" style={{ marginBottom: 24 }}>
        <p style={{ color: "rgba(245,240,232,.7)", fontStyle: "italic", marginBottom: 18 }}>
          {COACH_INTROS[coach.id](open)}
        </p>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: i < sections.length - 1 ? 18 : 0 }}>
            <div className="section-title">— {s.title}</div>
            <p>{s.body}</p>
          </div>
        ))}
      </div>

      {/* 2. Watch on YouTube — searches for the topic, always works */}
      <a
        href={`https://www.youtube.com/results?search_query=golf+${encodeURIComponent(open.title)}+tutorial+instruction`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", display: "block", marginBottom: 16 }}
      >
        <div style={{
          background: "rgba(255,0,0,.08)", border: "1px solid rgba(255,80,80,.25)",
          borderRadius: 12, padding: "16px 18px",
          display: "flex", alignItems: "center", gap: 14,
          transition: "background .15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,0,0,.14)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,0,0,.08)"}
        >
          <div style={{
            width: 44, height: 44, background: "#ff0000", borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ fontSize: 18, color: "white" }}>▶</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "var(--cream)", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
              Watch: {open.title}
            </div>
            <div style={{ color: "rgba(245,240,232,.5)", fontSize: 12 }}>
              Search YouTube for tutorials ↗
            </div>
          </div>
        </div>
      </a>

      {/* 3. Practice this drill CTA */}
      <div style={{
        background: "linear-gradient(135deg, rgba(200,168,75,.12), rgba(200,168,75,.06))",
        border: "1px solid var(--border)", borderRadius: 12, padding: "20px",
        marginBottom: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 20 }}>🎯</span>
          <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: 15 }}>Practice This Drill</span>
        </div>
        <p style={{ fontSize: 13, color: "rgba(245,240,232,.65)", lineHeight: 1.6, marginBottom: 14 }}>
          Head to the range, work on the drill from this lesson, then upload a photo of your swing. {coach.name} will give you feedback specific to what you just practiced.
        </p>
        {/* Camera angle recommendation */}
        <div style={{
          background: "rgba(0,0,0,.2)", borderRadius: 8, padding: "10px 14px",
          marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>📷</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold-light)", marginBottom: 3, textTransform: "uppercase", letterSpacing: ".4px" }}>
              Best angle: {open.angle === "both" ? "Face-on + Down the Line" : open.angle === "face-on" ? "Face-On" : "Down the Line"}
            </div>
            <div style={{ fontSize: 12, color: "rgba(245,240,232,.6)", lineHeight: 1.5 }}>
              {open.angleReason}
            </div>
          </div>
        </div>
        <button className="btn-gold" onClick={() => goSwing(open.drill)}>
          📹 Analyze My {open.title} Drill
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "30px 20px" }}>
      <h2 className="fade-up" style={{ color: "var(--gold)", fontSize: 28, marginBottom: 6 }}>Virtual Lessons</h2>
      <p className="fade-up" style={{ color: "rgba(245,240,232,.55)", marginBottom: 22 }}>{LESSONS.length} lessons with {coach.emoji} {coach.name}</p>
      <div className="fade-up" style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 24 }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            background: filter === c ? "var(--gold)" : "rgba(255,255,255,.06)",
            color: filter === c ? "var(--green-deep)" : "rgba(245,240,232,.65)",
            border: `1px solid ${filter === c ? "var(--gold)" : "var(--border)"}`,
            borderRadius: 20, padding: "5px 13px", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .15s",
          }}>{c}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {visible.map((l, i) => (
          <div key={l.id} className="lesson-row fade-up" style={{ animationDelay: `${i * 0.03}s` }} onClick={() => openLesson(l)}>
            <span style={{ fontSize: 26 }}>{l.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{l.title}</div>
              <div style={{ fontSize: 12, color: "rgba(245,240,232,.45)", marginTop: 2 }}>{l.cat}</div>
            </div>
            <span className="badge" style={{ color: DIFF_COLOR[l.diff], background: "rgba(200,168,75,.1)", border: "1px solid var(--border)" }}>{l.diff}</span>
            <span style={{ color: "var(--gold)", fontSize: 18, marginLeft: 4 }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Swing ─────────────────────────────────────────────────────────────────────
// ── Shared chat thread component ──────────────────────────────────────────────
function ChatThread({ messages, loading, error, coach, onFollowUp }) {
  const [followUp, setFollowUp] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function send() {
    if (!followUp.trim()) return;
    onFollowUp(followUp.trim());
    setFollowUp("");
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const suggestions = onFollowUp._suggestions || [];

  return (
    <div style={{ marginTop: 26 }}>
      {/* Message thread */}
      {messages.map((msg, i) => (
        <div key={i} style={{ marginBottom: 16, display: "flex", flexDirection: "column",
          alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
          {msg.role === "assistant" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>{coach.emoji}</span>
              <span style={{ color: "var(--gold)", fontWeight: 600, fontSize: 14 }}>{coach.name}</span>
            </div>
          )}
          <div style={{
            maxWidth: msg.role === "user" ? "80%" : "100%",
            background: msg.role === "user"
              ? "rgba(200,168,75,.15)"
              : "linear-gradient(135deg, var(--green-mid), var(--green-bright))",
            border: "1px solid var(--border)",
            borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
            padding: "14px 18px",
            fontSize: 14,
            lineHeight: 1.7,
            color: msg.role === "user" ? "var(--gold-light)" : "var(--cream)",
            whiteSpace: "pre-wrap",
          }}>
            {msg.content}
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 20 }}>{coach.emoji}</span>
          <div style={{
            background: "linear-gradient(135deg, var(--green-mid), var(--green-bright))",
            border: "1px solid var(--border)", borderRadius: "16px 16px 16px 4px",
            padding: "12px 18px", display: "flex", alignItems: "center", gap: 8,
          }}>
            <div className="spinner" style={{ width: 16, height: 16 }} />
            <span style={{ fontSize: 13, color: "rgba(245,240,232,.6)" }}>{coach.name} is thinking…</span>
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: "rgba(220,60,60,.12)", border: "1px solid rgba(220,60,60,.35)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#f87171", marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Suggestion chips */}
      {messages.length > 0 && !loading && suggestions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => { onFollowUp(s); }} style={{
              background: "rgba(200,168,75,.1)", border: "1px solid var(--border)",
              borderRadius: 20, padding: "6px 14px", fontSize: 12, color: "rgba(245,240,232,.7)",
              cursor: "pointer", transition: "all .15s", fontFamily: "'DM Sans',sans-serif",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "rgba(245,240,232,.7)"; }}
            >{s}</button>
          ))}
        </div>
      )}

      {/* Follow-up input */}
      {messages.length > 0 && !loading && (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea
            className="field-input"
            rows={2}
            placeholder={`Ask ${coach.name} a follow-up…`}
            value={followUp}
            onChange={e => setFollowUp(e.target.value)}
            onKeyDown={handleKey}
            style={{ flex: 1, resize: "none" }}
          />
          <button onClick={send} disabled={!followUp.trim() || loading} style={{
            background: followUp.trim() ? "linear-gradient(135deg, var(--gold), var(--gold-light))" : "rgba(255,255,255,.1)",
            border: "none", borderRadius: 8, width: 42, height: 42,
            cursor: followUp.trim() ? "pointer" : "not-allowed",
            fontSize: 18, flexShrink: 0, transition: "background .15s",
          }}>↑</button>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

// ── Swing Analyzer ─────────────────────────────────────────────────────────────
function Swing({ coach, addHistory, prefillDrill, clearDrill, audioEnabled }) {
  const [photos, setPhotos]     = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [notes, setNotes]       = useState(prefillDrill || "");
  const [speaking, setSpeaking] = useState(false);
  const inputRef                = useRef();

  useState(() => {
    if (prefillDrill) { setNotes(prefillDrill); clearDrill?.(); }
  });

  function handleFilePick(files) {
    if (!files?.length) return;
    setMessages([]); setError("");
    Array.from(files).forEach(f => {
      const preview = URL.createObjectURL(f);
      toBase64(f).then(b64 => {
        setPhotos(prev => [...prev, { id: f.name + f.size, preview, b64, mime: f.type }]);
      });
    });
  }

  function removePhoto(id) { setPhotos(prev => prev.filter(p => p.id !== id)); }

  const swingSystem = `You are ${coach.name}, an AI golf coach (${coach.style}). ${coach.desc} Analyze golf swings from photos and answer follow-up questions. Be specific, practical, and encouraging. Write in plain paragraphs.`;

  async function analyze() {
    setLoading(true); setError("");
    try {
      const hasPhotos = photos.length > 0;
      let firstMessage;
      if (hasPhotos) {
        const positionList = photos.map(p => p.label).join(", ");
        const content = [
          ...photos.map(p => ({ type: "image", source: { type: "base64", media_type: p.mime, data: p.b64 } })),
          { type: "text", text: `Analyze my golf swing. I have uploaded ${photos.length} photo${photos.length > 1 ? "s" : ""} showing: ${positionList}. ${photos.length > 1 ? "Analyze each position and how they connect — look for consistency across the sequence." : "Analyze this position in detail."} Cover setup, grip, club position, body rotation, and balance. Call out what is working and give 2-3 specific improvements.${notes ? " Additional context: " + notes : ""}` },
        ];
        firstMessage = { role: "user", content };
      } else {
        firstMessage = { role: "user", content: `Analyze my golf swing based on this description: ${notes || "standard full swing"}. Cover setup, posture, club position, body rotation, and give 2-3 specific improvements.` };
      }
      const result = await askClaude({ system: swingSystem, messages: [firstMessage] });
      const userDisplay = hasPhotos ? `${photos.length} swing photo${photos.length > 1 ? "s" : ""} uploaded${notes ? " — " + notes : ""}` : notes;
      setMessages([{ role: "user", content: userDisplay }, { role: "assistant", content: result }]);
      addHistory({ type: "swing", title: "Swing Analyzer", coach: coach.name, date: new Date().toLocaleDateString(), preview: result.slice(0, 130) + "..." });
      if (audioEnabled) { setSpeaking(true); speakText(result, coach.id); }
    } catch (e) {
      if (notes.trim()) {
        try {
          const fallback = { role: "user", content: `Analyze my golf swing based on this description: ${notes}. Give specific feedback on likely technique issues and 2-3 things to work on.` };
          const result = await askClaude({ system: swingSystem, messages: [fallback] });
          setMessages([{ role: "user", content: notes }, { role: "assistant", content: result }]);
          addHistory({ type: "swing", title: "Swing Analyzer", coach: coach.name, date: new Date().toLocaleDateString(), preview: result.slice(0, 130) + "..." });
          if (audioEnabled) { setSpeaking(true); speakText(result, coach.id); }
          return;
        } catch (e2) {}
      }
      setError("Photo upload isn't available right now — check your connection and try again. You can also describe your swing in the text box below and tap Analyze for detailed feedback.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFollowUp(text) {
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true); setError("");
    try {
      const apiMessages = newMessages.map((m, i) => {
        if (i === 0 && photos.length > 0) {
          return { role: "user", content: [
            ...photos.map(p => ({ type: "image", source: { type: "base64", media_type: p.mime, data: p.b64 } })),
            { type: "text", text: m.content },
          ]};
        }
        return { role: m.role, content: m.content };
      });
      const result = await askClaude({ system: swingSystem, messages: apiMessages });
      setMessages(prev => [...prev, { role: "assistant", content: result }]);
      if (audioEnabled) { setSpeaking(true); speakText(result, coach.id); }
    } catch (e) {
      setError("Couldn't send message. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  handleFollowUp._suggestions = messages.length > 0 ? [
    "Can you explain that in more detail?",
    "What drill would help most?",
    "Which is the most important fix?",
    "How does this affect my ball flight?",
  ] : [];

  function reset() { setPhotos([]); setMessages([]); setNotes(""); setError(""); }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "30px 20px" }}>
      <h2 className="fade-up" style={{ color: "var(--gold)", fontSize: 28, marginBottom: 6 }}>Swing Analyzer</h2>
      <p className="fade-up" style={{ color: "rgba(245,240,232,.55)", marginBottom: prefillDrill ? 14 : 24 }}>
        Record a slow-mo video, pause at key positions, and screenshot each one. Upload all four for a full swing analysis — or just one to start.
      </p>

      {prefillDrill && (
        <div className="fade-up" style={{
          background: "linear-gradient(135deg, rgba(200,168,75,.15), rgba(200,168,75,.06))",
          border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", marginBottom: 20,
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>🎯</span>
          <div>
            <div style={{ color: "var(--gold)", fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Drill Analysis Mode</div>
            <div style={{ fontSize: 12, color: "rgba(245,240,232,.6)", lineHeight: 1.5 }}>
              {coach.name} will review your swing specifically for this drill. Upload a photo of a key position — address, top of backswing, or impact works best.
            </div>
          </div>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" multiple
        onChange={e => handleFilePick(e.target.files)} />

      {messages.length === 0 && (
        <div style={{ marginBottom: 20 }}>
          {photos.length === 0 ? (
            /* Empty upload zone */
            <div className="upload-zone fade-up" onClick={() => inputRef.current.click()}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>📸</div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Upload swing photos</div>
              <div style={{ color: "rgba(245,240,232,.6)", fontSize: 13, marginBottom: 10, lineHeight: 1.6 }}>
                For best results, record a slow-mo video of your swing then pause and screenshot at these four positions:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, textAlign: "left", width: "100%" }}>
                {[["🧍","Address","Setup before the swing"],["⬆","Top of backswing","Club at its highest point"],["💥","Impact","Moment of contact"],["🔄","Follow through","Post-impact extension"]].map(([icon, label, hint]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,.2)", borderRadius: 8, padding: "6px 10px" }}>
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)" }}>{label}</span>
                      <span style={{ fontSize: 11, color: "rgba(245,240,232,.4)", marginLeft: 6 }}>{hint}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ color: "rgba(245,240,232,.35)", fontSize: 11 }}>Tap to select photos · Select multiple at once</div>
            </div>
          ) : (
            /* Thumbnail strip */
            <div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                {photos.map(p => (
                  <div key={p.id} style={{ position: "relative", width: 76, height: 76, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
                    <img src={p.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button onClick={() => removePhoto(p.id)} style={{
                      position: "absolute", top: 3, right: 3, background: "rgba(0,0,0,.7)",
                      border: "none", color: "#fff", borderRadius: "50%", width: 20, height: 20,
                      cursor: "pointer", fontSize: 11, lineHeight: 1,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>✕</button>
                  </div>
                ))}
                {/* Add more */}
                <button onClick={() => inputRef.current.click()} style={{
                  width: 76, height: 76, borderRadius: 8, border: "2px dashed var(--border)",
                  background: "transparent", color: "rgba(245,240,232,.3)", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 4, fontSize: 22,
                }}>
                  <span>+</span>
                  <span style={{ fontSize: 9, fontFamily: "'DM Sans',sans-serif" }}>Add more</span>
                </button>
              </div>
              <div style={{ fontSize: 11, color: "rgba(245,240,232,.35)" }}>
                {photos.length} photo{photos.length !== 1 ? "s" : ""} selected
              </div>
            </div>
          )}
          <div style={{ marginTop: 14, marginBottom: 12 }}>
            <label className="field-label" style={{ marginBottom: 6 }}>
              Any context? <span style={{ fontWeight: 400, color: "rgba(245,240,232,.3)" }}>(optional)</span>
            </label>
            <textarea className="field-input" placeholder="e.g. I pushed that shot right"
              value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          </div>
          {(photos.length > 0 || notes.trim()) && (
            <button className="btn-gold" onClick={analyze} disabled={loading}>
              {loading
                ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><div className="spinner" />Analyzing…</span>
                : `🏌 Analyze with ${coach.name}${photos.length > 0 ? ` (${photos.length} photo${photos.length > 1 ? "s" : ""})` : ""}`}
            </button>
          )}
        </div>
      )}

      {/* Photo thumbnails shown above chat after analysis */}
      {messages.length > 0 && photos.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" }}>
          {photos.map(p => (
            <img key={p.id} src={p.preview} alt="" style={{ flexShrink: 0, width: 60, height: 60, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }} />
          ))}
        </div>
      )}

      <ChatThread messages={messages} loading={loading} error={error} coach={coach} onFollowUp={handleFollowUp} />

      {messages.length > 0 && !loading && (
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button className="btn-outline" onClick={reset} style={{ flex: 1 }}>Start New Analysis</button>
          {audioEnabled && (
            <button onClick={() => {
              if (isSpeaking()) { stopSpeech(); setSpeaking(false); }
              else {
                const last = [...messages].reverse().find(m => m.role === "assistant");
                if (last) { setSpeaking(true); speakText(last.content, coach.id); }
              }
            }} style={{
              padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)",
              background: speaking && isSpeaking() ? "rgba(76,175,120,.15)" : "rgba(255,255,255,.06)",
              color: speaking && isSpeaking() ? "#4caf78" : "rgba(245,240,232,.55)",
              cursor: "pointer", fontSize: 16,
            }}>
              {speaking && isSpeaking() ? "⏹" : "🔊"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
// ── Caddy ─────────────────────────────────────────────────────────────────────
function Caddy({ coach, addHistory, audioEnabled, inBag, rangeSessions }) {
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [b64Cache, setB64Cache] = useState(null);
  const [mimeCache, setMimeCache] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const inputRef = useRef();

  function pick(f) {
    if (!f) return;
    setFile(f); setPreview(URL.createObjectURL(f));
    toBase64(f).then(b64 => { setB64Cache(b64); setMimeCache(f.type); });
  }

  const bagSummary = inBag && inBag.length > 0 && rangeSessions.length > 0
    ? "\n\nThe player's carry distances by club:\n" + inBag
        .map(clubId => {
          const avgs = calcClubAverages(clubId, rangeSessions);
          const club = CLUBS ? CLUBS.find(c => c.id === clubId) : null;
          return avgs.carry ? `${club ? club.label : clubId}: ${avgs.carry} yards carry` : null;
        })
        .filter(Boolean)
        .join(", ")
    : "";

  const caddySystem = `You are ${coach.name}, an AI golf caddy (${coach.style}). ${coach.desc} Give pre-shot advice and answer follow-up questions about shot selection and strategy. Be decisive and specific.${bagSummary}

For the initial read, structure as:
1) SITUATION READ — summarize the situation including any lie adjustments (ball above feet: grip down, expect draw, aim right. Ball below feet: full grip, expect fade, aim left. Uphill: more club, expect left. Downhill: less club, ball flies lower and right. Rough: account for flier or reduced spin).
2) THREE OPTIONS — SAFE, PERCENTAGE, and HERO — each with specific club, target, and shot shape. Use the player's actual distances when recommending clubs.
3) YOUR RECOMMENDATION — which option and exactly why.

For follow-up questions, answer conversationally and directly. Write in plain paragraphs.`;

  async function getAdvice() {
    if (!synopsis.trim() && !file) return;
    setLoading(true); setError("");
    try {
      let firstMessage;
      if (b64Cache && mimeCache?.startsWith("image/")) {
        firstMessage = { role: "user", content: [
          { type: "image", source: { type: "base64", media_type: mimeCache, data: b64Cache } },
          { type: "text", text: `Give me caddy advice for this shot.${synopsis ? " Here's the situation: " + synopsis : ""}` },
        ]};
      } else {
        firstMessage = { role: "user", content: `Give me caddy advice for this shot. Here's the situation: ${synopsis || "150 yard approach, flat lie, no wind, no hazards"}` };
      }
      const result = await askClaude({ system: caddySystem, messages: [firstMessage] });
      setMessages([{ role: "user", content: synopsis || "Shot described via photo" }, { role: "assistant", content: result }]);
      addHistory({ type: "caddy", title: "Caddy Advice", coach: coach.name, date: new Date().toLocaleDateString(), preview: result.slice(0, 130) + "…" });
      if (audioEnabled) { setSpeaking(true); speakText(result, coach.id); }
    } catch (e) {
      setError("Couldn't get caddy advice — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFollowUp(text) {
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true); setError("");
    try {
      const apiMessages = newMessages.map((m, i) => {
        if (i === 0 && b64Cache && mimeCache?.startsWith("image/")) {
          return { role: "user", content: [
            { type: "image", source: { type: "base64", media_type: mimeCache, data: b64Cache } },
            { type: "text", text: m.content },
          ]};
        }
        return { role: m.role, content: m.content };
      });
      const result = await askClaude({ system: caddySystem, messages: apiMessages });
      setMessages(prev => [...prev, { role: "assistant", content: result }]);
      if (audioEnabled) { setSpeaking(true); speakText(result, coach.id); }
    } catch (e) {
      setError("Couldn't send message. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  handleFollowUp._suggestions = messages.length > 0 ? [
    "Which club exactly?",
    "What if I miss right?",
    "What's the bailout if I'm not comfortable?",
    "How does the wind change things?",
  ] : [];

  function reset() { setFile(null); setPreview(null); setMessages([]); setSynopsis(""); setB64Cache(null); setMimeCache(null); }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "30px 20px" }}>
      <h2 className="fade-up" style={{ color: "var(--gold)", fontSize: 28, marginBottom: 6 }}>On-Course Caddy</h2>
      <p className="fade-up" style={{ color: "rgba(245,240,232,.55)", marginBottom: 24 }}>
        Describe your shot and {coach.emoji} {coach.name} gives you safe, smart, and bold options.
      </p>

      {messages.length === 0 && (
        <>
          <input ref={inputRef} type="file" accept="image/*" onChange={e => pick(e.target.files[0])} />
          <div className="upload-zone fade-up" onClick={() => inputRef.current.click()}
            style={{ marginBottom: 18, padding: preview ? "12px" : "20px" }}>
            {preview
              ? <div style={{ position: "relative" }}>
                  <img src={preview} alt="shot" style={{ maxHeight: 180, borderRadius: 8, objectFit: "contain" }} />
                  <button onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); setB64Cache(null); }} style={{
                    position: "absolute", top: -8, right: -8, background: "rgba(0,0,0,.7)",
                    border: "none", color: "#fff", borderRadius: "50%", width: 24, height: 24,
                    cursor: "pointer", fontSize: 12,
                  }}>✕</button>
                </div>
              : <>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>📷</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Add a photo (optional)</div>
                  <div style={{ color: "rgba(245,240,232,.4)", fontSize: 12, marginTop: 3 }}>Tap to take or upload a photo of your shot</div>
                </>
            }
          </div>

          <div className="fade-up" style={{ marginBottom: 16 }}>
            <label className="field-label" style={{ marginBottom: 8 }}>Describe your shot</label>
            <textarea
              className="field-input"
              rows={4}
              placeholder={"e.g. 145 yards to the pin, slight left-to-right breeze, ball on a downhill lie in the fairway, bunker short-right of the green"}
              value={synopsis}
              onChange={e => setSynopsis(e.target.value)}
              style={{ lineHeight: 1.6 }}
            />
            <div style={{ fontSize: 11, color: "rgba(245,240,232,.35)", marginTop: 6, lineHeight: 1.5 }}>
              💡 Include distance, wind, lie, and any hazards for the best read
            </div>
          </div>

          <button className="btn-gold" onClick={getAdvice} disabled={loading || (!synopsis.trim() && !file)}>
            {loading
              ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><div className="spinner" />Reading the shot…</span>
              : `🎯 Get ${coach.name}'s Read`}
          </button>
        </>
      )}

      <ChatThread messages={messages} loading={loading} error={error} coach={coach} onFollowUp={handleFollowUp} />

      {messages.length > 0 && !loading && (
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button className="btn-outline" onClick={reset} style={{ flex: 1 }}>New Shot</button>
          {audioEnabled && (
            <button onClick={() => {
              if (isSpeaking()) { stopSpeech(); setSpeaking(false); }
              else {
                const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
                if (lastAssistant) { setSpeaking(true); speakText(lastAssistant.content, coach.id); }
              }
            }} style={{
              padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)",
              background: speaking && isSpeaking() ? "rgba(76,175,120,.15)" : "rgba(255,255,255,.06)",
              color: speaking && isSpeaking() ? "#4caf78" : "rgba(245,240,232,.55)",
              cursor: "pointer", fontSize: 16,
            }}>
              {speaking && isSpeaking() ? "⏹" : "🔊"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Score ─────────────────────────────────────────────────────────────────────
const TEE_COLORS = ["White", "Blue", "Gold", "Red", "Black", "Silver", "Green", "Orange"];

function emptyHole() {
  return { par: 4, yards: "", hdcp: "", score: "", driveYards: "", fairway: false, gir: false, penalties: "", sand: "", putts: "" };
}

function emptyRound() {
  const today = new Date();
  const iso = today.toISOString().split("T")[0];
  return {
    id: Date.now(),
    date: iso,
    course: "", rating: "", slope: "", tee: "",
    roundType: "course", // "course" | "simulator"
    holes: Array.from({ length: 18 }, () => emptyHole()),
  };
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  // Handle both ISO (YYYY-MM-DD) and locale strings
  const d = new Date(dateStr + "T12:00:00"); // noon to avoid timezone shifts
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function _holeFromCourse(courseHole) {
  return { ...emptyHole(), par: courseHole.par, yards: courseHole.yards, hdcp: courseHole.hdcp ?? "" };
}

function calcStats(holes) {
  const played    = holes.filter(h => h.score !== "" && !isNaN(h.score));
  const total     = played.reduce((s, h) => s + Number(h.score), 0);
  const totalPar  = played.reduce((s, h) => s + h.par, 0);
  const fwHoles   = played.filter(h => h.par !== 3);
  const fwHit     = fwHoles.filter(h => h.fairway).length;
  const girHit    = played.filter(h => h.gir).length;
  const puttHoles = played.filter(h => h.putts !== "");
  const totalPutts = puttHoles.reduce((s, h) => s + Number(h.putts), 0);
  const penalties  = played.reduce((s, h) => s + (Number(h.penalties) || 0), 0);
  const sand       = played.reduce((s, h) => s + (Number(h.sand) || 0), 0);
  return {
    total, totalPar, diff: total - totalPar,
    fwPct:  fwHoles.length  ? Math.round(fwHit / fwHoles.length * 100) : null,
    girPct: played.length   ? Math.round(girHit / played.length * 100) : null,
    puttsAvg: puttHoles.length ? (totalPutts / puttHoles.length).toFixed(1) : null,
    totalPutts: puttHoles.length ? totalPutts : null,
    penalties, sand, played: played.length,
  };
}

function diffLabel(diff) {
  if (diff === null || diff === undefined) return "";
  if (diff === 0) return "E";
  return diff > 0 ? `+${diff}` : `${diff}`;
}

function scoreColor(diff) {
  if (diff === null || diff === undefined || diff === "") return "var(--cream)";
  const d = Number(diff);
  if (d <= -2) return "#ffd700";
  if (d === -1) return "#4caf78";
  if (d === 0)  return "var(--cream)";
  if (d === 1)  return "#e09a4a";
  return "#e05c5c";
}

// Cell styles
const cellBase = {
  minWidth: 46, height: 32,
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 12, fontWeight: 600,
};
const _inputCell = {
  ...cellBase,
  background: "rgba(0,0,0,.25)",
  borderRadius: 4,
};

function ScorecardInput({ value, onChange, min = 0, max = 20, width = 36, color }) {
  return (
    <input
      type="number" min={min} max={max}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width, textAlign: "center", background: "rgba(0,0,0,.3)",
        border: "1px solid rgba(255,255,255,.1)", borderRadius: 4,
        color: color || "var(--cream)", fontSize: 12, fontWeight: 700,
        padding: "3px 0", fontFamily: "'DM Sans',sans-serif", outline: "none",
        height: 28,
      }}
    />
  );
}

function CheckCell({ checked, onToggle, disabled }) {
  return (
    <button onClick={disabled ? null : onToggle} style={{
      width: 24, height: 24, borderRadius: 4, border: "1px solid",
      borderColor: disabled ? "transparent" : checked ? "var(--green-light)" : "rgba(255,255,255,.18)",
      background: disabled ? "transparent" : checked ? "rgba(76,175,120,.3)" : "rgba(0,0,0,.2)",
      cursor: disabled ? "default" : "pointer",
      fontSize: 12, color: "var(--green-light)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {!disabled && checked ? "✓" : ""}
    </button>
  );
}

function Score({ savedRounds, onSaveRound, onUpdateRound, onDeleteRound, courses, setCourses }) {
  const [round, setRound]       = useState(emptyRound());
  const saved = savedRounds;
  const [editingId, setEditingId] = useState(null);
  const [view, setView]         = useState("setup");
  const [showSaveCourse, setShowSaveCourse] = useState(false);
  const [showManageRows, setShowManageRows] = useState(false);
  // Rows the player has chosen to hide — persisted in localStorage so it sticks
  const [hiddenRows, setHiddenRows] = useState(() => {
    try {
      const saved = localStorage.getItem("scratch:hiddenRows");
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  const [_scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState("idle");
  const [scanImg, setScanImg]   = useState(null);
  const [scanData, setScanData] = useState(null);
  const [scanError, setScanError] = useState("");
  const scanInputRef = useRef();

  function toggleHideRow(key) {
    setHiddenRows(prev => {
      const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
      try { localStorage.setItem("scratch:hiddenRows", JSON.stringify(next)); } catch (e) {}
      return next;
    });
  }

  function updateHole(idx, key, val) {
    setRound(r => {
      const holes = [...r.holes];
      holes[idx] = { ...holes[idx], [key]: val };
      return { ...r, holes };
    });
  }

  function saveRound() {
    if (!round.holes.some(h => h.score !== "")) return;
    if (editingId) {
      onUpdateRound({ ...round, id: editingId });
      setEditingId(null);
    } else {
      onSaveRound(round);
    }
    setRound(emptyRound());
    setView("rounds");
  }

  function saveCourse() {
    if (!round.course.trim()) return;
    const teeData = {
      tee: round.tee,
      rating: round.rating,
      slope: round.slope,
      holes: round.holes.map(h => ({ par: h.par, yards: h.yards, hdcp: h.hdcp })),
    };
    const existing = courses.find(x => x.name.toLowerCase() === round.course.toLowerCase().trim());
    if (existing) {
      // Add or update tee set for this course
      const tees = existing.tees || [];
      const otherTees = tees.filter(t => t.tee.toLowerCase() !== teeData.tee.toLowerCase());
      setCourses(c => c.map(x => x.id === existing.id ? { ...x, tees: [...otherTees, teeData] } : x));
    } else {
      const course = {
        id: Date.now(),
        name: round.course.trim(),
        tees: [teeData],
      };
      setCourses(c => [course, ...c]);
    }
    setShowSaveCourse(false);
  }

  function loadCourse(course, tee) {
    const teeData = tee || course.tees?.[0];
    setRound(r => ({
      ...r,
      course: course.name,
      rating: teeData?.rating || "",
      slope: teeData?.slope || "",
      tee: teeData?.tee || "",
      holes: r.holes.map((h, i) => ({
        ...h,
        par:   teeData?.holes?.[i]?.par   ?? h.par,
        yards: teeData?.holes?.[i]?.yards ?? h.yards,
        hdcp:  teeData?.holes?.[i]?.hdcp  ?? h.hdcp,
      })),
    }));
    setView("card");
  }

  function deleteCourse(id) {
    setCourses(c => c.filter(x => x.id !== id));
  }

  const allStats   = calcStats(round.holes);
  const _frontStats = calcStats(round.holes.slice(0, 9));
  const _backStats  = calcStats(round.holes.slice(9));

  const ROWS = [
    { key: "yards",      label: "Yards",   type: "input",    inputWidth: 44 },
    { key: "hdcp",       label: "Hdcp",    type: "input",    inputWidth: 36 },
    { key: "par",        label: "Par",     type: "par" },
    { key: "score",      label: "Score",   type: "score" },
    { key: "driveYards", label: "Drive\nYds", type: "input", inputWidth: 44, par3hide: true, smallLabel: true },
    { key: "fairway",    label: "FWY",     type: "check" },
    { key: "gir",        label: "GIR",     type: "check" },
    { key: "putts",      label: "Putts",   type: "input",    inputWidth: 36 },
    { key: "sand",       label: "Sand",    type: "input",    inputWidth: 36 },
    { key: "penalties",  label: "Pen\nStks", type: "input",    inputWidth: 36, smallLabel: true },
  ];

  // These rows can't be hidden
  const REQUIRED_ROWS = ["par", "score"];
  const visibleRows = ROWS.filter(r => !hiddenRows.includes(r.key));

  const labelW = 52;
  const colW   = 46;
  const totW   = 50;

  const rowStyle = (isHeader) => ({
    display: "flex", alignItems: "center", minWidth: "100%",
    background: isHeader ? "rgba(200,168,75,.08)" : "transparent",
    borderBottom: "1px solid rgba(255,255,255,.04)",
  });

  function totalForRow(key, holes) {
    if (key === "yards")      return holes.reduce((s,h) => s + (Number(h.yards)||0), 0);
    if (key === "hdcp")       return "";
    if (key === "par")        return holes.reduce((s,h) => s + h.par, 0);
    if (key === "score")      return holes.filter(h=>h.score!=="").reduce((s,h) => s + Number(h.score), 0);
    if (key === "driveYards") {
      const driven = holes.filter(h => h.par !== 3 && h.driveYards !== "");
      return driven.length ? Math.round(driven.reduce((s,h) => s + Number(h.driveYards), 0) / driven.length) : null;
    }
    if (key === "putts")      return holes.filter(h=>h.putts!=="").reduce((s,h) => s + Number(h.putts), 0);
    if (key === "sand")       return holes.filter(h=>h.sand!=="").reduce((s,h) => s + Number(h.sand), 0);
    if (key === "penalties")  return holes.filter(h=>h.penalties!=="").reduce((s,h) => s + Number(h.penalties), 0);
    if (key === "fairway")    return holes.filter(h=>h.par!==3).filter(h=>h.fairway).length;
    if (key === "gir")        return holes.filter(h=>h.gir).length;
    return "";
  }

  function totalsDisplay(key, holes) {
    if (key === "hdcp") return "";
    if (key === "driveYards") {
      const avg = totalForRow("driveYards", holes);
      return avg !== null ? `${avg}y` : "—";
    }
    const val = totalForRow(key, holes);
    if (val === 0 && (key==="sand"||key==="penalties")) return "0";
    if (val === 0 && key==="yards") return "0";
    if (!val && val !== 0) return "—";
    if (key === "score") {
      const par = holes.reduce((s,h) => s + h.par, 0);
      const played = holes.filter(h=>h.score!=="").length;
      if (!played) return "—";
      const diff = val - par;
      return `${val} (${diffLabel(diff)})`;
    }
    if (key === "fairway") {
      const fw = holes.filter(h=>h.par!==3).length;
      return fw ? `${val}/${fw}` : "—";
    }
    if (key === "gir") return `${val}/${holes.length}`;
    return val || "—";
  }

  async function scanScorecard(file) {
    setScanStep("loading");
    setScanError("");
    try {
      const b64 = await toBase64(file);
      const system = `You are a golf scorecard reader. Extract scorecard data from the image and return ONLY valid JSON, nothing else. No markdown, no backticks, just raw JSON.

Return this exact structure:
{
  "course": "course name",
  "tees": [
    {
      "tee": "tee color/name e.g. Blue, White, Red",
      "rating": "course rating e.g. 71.2",
      "slope": "slope rating e.g. 128",
      "holes": [
        { "hole": 1, "par": 4, "yards": 385, "hdcp": 7 },
        ... all 18 holes
      ]
    }
  ]
}

Extract ALL tee sets visible on the scorecard. If yardage or hdcp is not visible for a hole, use null. Always return 18 holes per tee set.`;

      const result = await askClaude({
        system,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: file.type, data: b64 } },
          { type: "text", text: "Extract all scorecard data from this image and return as JSON." },
        ]}],
      });

      // Strip any accidental markdown
      const clean = result.replace(/```json|```/gi, "").trim();
      const data = JSON.parse(clean);
      setScanData(data);
      setScanStep(data.tees?.length > 1 ? "pickTee" : "done");
      if (data.tees?.length === 1) applyScan(data, data.tees[0]);
    } catch (e) {
      setScanError("Couldn't read the scorecard. Make sure the image is clear and well-lit, then try again.");
      setScanStep("preview");
    }
  }

  function applyScan(data, tee) {
    setRound(r => ({
      ...r,
      course: data.course || r.course,
      rating: tee.rating || "",
      slope:  tee.slope  || "",
      tee:    tee.tee    || "",
      holes: r.holes.map((h, i) => {
        const th = tee.holes?.[i];
        return {
          ...h,
          par:   th?.par   != null ? th.par   : h.par,
          yards: th?.yards != null ? String(th.yards) : h.yards,
          hdcp:  th?.hdcp  != null ? String(th.hdcp)  : h.hdcp,
        };
      }),
    }));
    setScanStep("done");
    setScanning(false);
    setScanData(null);
    setScanImg(null);
    setView("card");
  }

  if (view === "courses") return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "30px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ color: "var(--gold)", fontSize: 28 }}>My Courses</h2>
        <button className="btn-outline" style={{ fontSize: 12 }} onClick={() => setView("card")}>← Back</button>
      </div>
      {courses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🏌</div>
          <p style={{ color: "rgba(245,240,232,.55)", marginBottom: 6 }}>No courses saved yet.</p>
          <p style={{ fontSize: 13, color: "rgba(245,240,232,.35)" }}>
            Fill in course info on the scorecard or scan a scorecard photo, then tap "Save This Course."
          </p>
        </div>
      ) : courses.map((c, i) => (
        <div key={c.id} className="card fade-up" style={{ padding: "16px 18px", marginBottom: 12, animationDelay: `${i * 0.04}s` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--cream)" }}>{c.name}</div>
            <button onClick={() => deleteCourse(c.id)} style={{
              background: "rgba(220,60,60,.15)", border: "1px solid rgba(220,60,60,.3)",
              borderRadius: 6, color: "#f87171", padding: "6px 10px", cursor: "pointer", fontSize: 12,
            }}>Remove</button>
          </div>
          {/* Tee sets */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(c.tees || []).map((t, ti) => (
              <div key={ti} style={{
                background: "rgba(0,0,0,.2)", borderRadius: 8, padding: "10px 12px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <div style={{
                      width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                      background: t.tee?.toLowerCase() === "white" ? "#eee"
                        : t.tee?.toLowerCase() === "blue"  ? "#4a90d9"
                        : t.tee?.toLowerCase() === "red"   ? "#e05c5c"
                        : t.tee?.toLowerCase() === "gold" || t.tee?.toLowerCase() === "yellow" ? "var(--gold)"
                        : t.tee?.toLowerCase() === "black" ? "#333"
                        : t.tee?.toLowerCase() === "green" ? "var(--green-bright)"
                        : "rgba(255,255,255,.3)",
                      border: "1px solid rgba(255,255,255,.2)",
                    }} />
                    <span style={{ fontWeight: 700, fontSize: 13, color: "var(--cream)" }}>{t.tee || "Unknown"} Tees</span>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(245,240,232,.4)" }}>
                    {t.rating && `Rating: ${t.rating}`}{t.rating && t.slope ? "  ·  " : ""}{t.slope && `Slope: ${t.slope}`}
                    {t.holes?.some(h=>h.yards) && `  ·  ${t.holes.reduce((s,h)=>s+(Number(h.yards)||0),0).toLocaleString()} yds`}
                  </div>
                </div>
                <button className="btn-gold" style={{ width: "auto", padding: "7px 14px", fontSize: 12 }}
                  onClick={() => loadCourse(c, t)}>Load</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (view === "rounds") return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "30px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ color: "var(--gold)", fontSize: 28 }}>Round History</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-outline" style={{ fontSize: 12 }} onClick={() => setView("courses")}>Courses</button>
          <button className="btn-gold" style={{ width: "auto", padding: "10px 20px" }} onClick={() => { setRound(emptyRound()); setView("setup"); }}>+ New Round</button>
        </div>
      </div>
      {saved.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📊</div>
          <p style={{ color: "rgba(245,240,232,.45)" }}>No rounds saved yet.</p>
        </div>
      ) : saved.map((r, i) => {
        const s = calcStats(r.holes);
        return (
          <div key={r.id} className="card fade-up" style={{ padding: "16px 18px", marginBottom: 12, animationDelay: `${i * 0.05}s` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{r.course || "Unnamed Course"}</span>
                  {r.roundType === "simulator" && (
                    <span style={{ fontSize: 10, background: "rgba(74,144,217,.2)", color: "#4a90d9", border: "1px solid rgba(74,144,217,.35)", borderRadius: 10, padding: "2px 8px", fontWeight: 600 }}>SIM</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "rgba(245,240,232,.4)", marginTop: 2 }}>
                  {formatDate(r.date)}
                  {r.tee && ` · ${r.tee} Tees`}
                  {r.rating && ` · Rating: ${r.rating}`}
                  {r.slope  && ` · Slope: ${r.slope}`}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: scoreColor(s.diff), lineHeight: 1 }}>{s.total || "—"}</div>
                <div style={{ fontSize: 11, color: "rgba(245,240,232,.4)" }}>{diffLabel(s.diff)}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 8, justifyContent: "flex-end" }}>
                  <button onClick={() => {
                    setRound({ ...r });
                    setEditingId(r.id);
                    setView("card");
                  }} style={{
                    fontSize: 11, padding: "4px 10px", borderRadius: 6,
                    border: "1px solid var(--border)", background: "rgba(255,255,255,.06)",
                    color: "rgba(245,240,232,.6)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                  }}>Edit</button>
                  <button onClick={() => { if (window.confirm("Delete this round?")) onDeleteRound(r.id); }} style={{
                    fontSize: 11, padding: "4px 10px", borderRadius: 6,
                    border: "1px solid rgba(224,92,92,.3)", background: "rgba(224,92,92,.08)",
                    color: "#e05c5c", cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                  }}>Delete</button>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
              {[
                { label: "FWY",    value: s.fwPct   !== null ? `${s.fwPct}%`  : "—" },
                { label: "GIR",    value: s.girPct  !== null ? `${s.girPct}%` : "—" },
                { label: "Putts",  value: s.totalPutts !== null ? s.totalPutts : "—" },
                { label: "Sand",   value: s.sand  || "0" },
                { label: "Pen.",   value: s.penalties || "0" },
              ].map(stat => (
                <div key={stat.label} style={{ background: "rgba(0,0,0,.2)", borderRadius: 8, padding: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gold)" }}>{stat.value}</div>
                  <div style={{ fontSize: 10, color: "rgba(245,240,232,.4)", marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  function teeColor(t) {
    const l = t?.toLowerCase();
    return l === "white" ? "#eee" : l === "blue" ? "#4a90d9" : l === "red" ? "#e05c5c"
      : (l === "gold" || l === "yellow") ? "var(--gold)" : l === "black" ? "#222"
      : l === "silver" ? "#aaa" : l === "green" ? "var(--green-bright)"
      : l === "orange" ? "#e07a30" : "rgba(255,255,255,.35)";
  }

  if (view === "setup") return (
    <div style={{ maxWidth: 580, margin: "0 auto", padding: "30px 20px" }}>
      <input ref={scanInputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => {
          const f = e.target.files[0]; if (!f) return;
          setScanImg(URL.createObjectURL(f)); setScanStep("preview"); setScanError(""); setScanData(null);
          scanInputRef.current._file = f;
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ color: "var(--gold)", fontSize: 26 }}>New Round</h2>
        <button className="btn-outline" style={{ fontSize: 12 }} onClick={() => setView("rounds")}>Rounds →</button>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label className="field-label">Date Played</label>
        <input type="date" className="field-input" value={round.date}
          onChange={e => setRound(r => ({ ...r, date: e.target.value }))}
          style={{ fontSize: 13, colorScheme: "dark", maxWidth: 200 }} />
      </div>

      {/* Round type toggle */}
      <div style={{ marginBottom: 24 }}>
        <label className="field-label" style={{ marginBottom: 8 }}>Round Type</label>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { value: "course",    icon: "⛳", label: "On the Course",  sub: "Counts toward handicap" },
            { value: "simulator", icon: "🖥", label: "Simulator",      sub: "Tracked separately" },
          ].map(opt => (
            <button key={opt.value} onClick={() => setRound(r => ({ ...r, roundType: opt.value }))} style={{
              flex: 1, padding: "14px 12px", borderRadius: 12, border: "2px solid",
              borderColor: round.roundType === opt.value ? "var(--gold)" : "var(--border)",
              background: round.roundType === opt.value ? "rgba(200,168,75,.12)" : "var(--card-bg)",
              cursor: "pointer", textAlign: "center", transition: "all .15s",
            }}>
              <div style={{ fontSize: 26, marginBottom: 4 }}>{opt.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: round.roundType === opt.value ? "var(--gold)" : "var(--cream)", marginBottom: 2 }}>{opt.label}</div>
              <div style={{ fontSize: 11, color: "rgba(245,240,232,.4)" }}>{opt.sub}</div>
            </button>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(245,240,232,.5)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 12 }}>
        {round.roundType === "simulator" ? "Load or enter your simulator course" : "How would you like to set up the course?"}
      </div>
      {[
        { icon: "📂", label: "Load Saved Course", sub: courses.length > 0 ? `${courses.length} course${courses.length !== 1 ? "s" : ""} saved — pick your tees and go` : "No saved courses yet", action: () => setView("courses"), gold: false },
        { icon: "📸", label: "Scan Scorecard Photo", sub: "Take a photo — pick your tees — data fills in automatically", action: () => { setScanStep("idle"); setScanImg(null); setScanError(""); setScanData(null); setView("scan"); }, gold: true },
        { icon: "✏", label: "Enter Manually", sub: "Type in the course name, tees, rating, slope, and hole data", action: () => setView("manual"), gold: false },
      ].map((opt, i) => (
        <button key={i} onClick={opt.action} style={{
          width: "100%", marginBottom: 10, padding: "16px 18px",
          background: opt.gold ? "linear-gradient(135deg, rgba(200,168,75,.12), rgba(200,168,75,.04))" : "var(--card-bg)",
          border: "1px solid var(--border)", borderRadius: 12, cursor: "pointer", textAlign: "left",
          transition: "border-color .15s", display: "flex", alignItems: "center", gap: 14,
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--gold)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
        >
          <div style={{ fontSize: 32, flexShrink: 0 }}>{opt.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: opt.gold ? "var(--gold)" : "var(--cream)", marginBottom: 3 }}>{opt.label}</div>
            <div style={{ fontSize: 13, color: "rgba(245,240,232,.5)" }}>{opt.sub}</div>
          </div>
          <span style={{ color: "var(--gold)", fontSize: 20 }}>›</span>
        </button>
      ))}
    </div>
  );

  if (view === "scan") return (
    <div style={{ maxWidth: 580, margin: "0 auto", padding: "30px 20px" }}>
      <input ref={scanInputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => {
          const f = e.target.files[0]; if (!f) return;
          setScanImg(URL.createObjectURL(f)); setScanStep("preview"); setScanError(""); setScanData(null);
          scanInputRef.current._file = f;
        }}
      />
      <button className="btn-outline" onClick={() => setView("setup")} style={{ marginBottom: 22 }}>← Back</button>
      <h2 style={{ color: "var(--gold)", fontSize: 24, marginBottom: 6 }}>Scan Scorecard</h2>
      <p style={{ color: "rgba(245,240,232,.5)", fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
        Take a photo of the scorecard — usually on the back of the cart or course guide. Make sure hole, par, yardage, and handicap rows are clearly visible.
      </p>
      {scanStep === "idle" && (
        <button className="btn-gold" onClick={() => scanInputRef.current.click()}>📷 Take or Upload Scorecard Photo</button>
      )}
      {(scanStep === "preview" || scanStep === "loading") && scanImg && (
        <>
          <img src={scanImg} alt="scorecard" style={{ width: "100%", borderRadius: 10, marginBottom: 14, maxHeight: 260, objectFit: "contain", background: "rgba(0,0,0,.3)", border: "1px solid var(--border)" }} />
          {scanError && <div style={{ fontSize: 13, color: "#f87171", marginBottom: 12 }}>⚠ {scanError}</div>}
          {scanStep === "preview" && (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-gold" onClick={() => scanScorecard(scanInputRef.current._file)} style={{ flex: 2 }}>✨ Read Scorecard</button>
              <button className="btn-outline" onClick={() => scanInputRef.current.click()} style={{ flex: 1 }}>Retake</button>
            </div>
          )}
          {scanStep === "loading" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(245,240,232,.6)", fontSize: 13 }}>
              <div className="spinner" /> Reading scorecard data…
            </div>
          )}
        </>
      )}
      {scanStep === "pickTee" && scanData && (
        <>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)", marginBottom: 4 }}>
            ✅ Found {scanData.tees?.length} tee set{scanData.tees?.length !== 1 ? "s" : ""}
          </div>
          <p style={{ fontSize: 13, color: "rgba(245,240,232,.5)", marginBottom: 16 }}>Select the tees you're playing:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {scanData.tees?.map((t, i) => (
              <button key={i} onClick={() => applyScan(scanData, t)} style={{
                background: "var(--card-bg)", border: "1px solid var(--border)",
                borderRadius: 10, padding: "14px 16px", cursor: "pointer", textAlign: "left",
                display: "flex", alignItems: "center", gap: 14, transition: "border-color .15s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--gold)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
              >
                <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: teeColor(t.tee), border: "1px solid rgba(255,255,255,.25)" }} />
                <div>
                  <div style={{ fontWeight: 700, color: "var(--cream)", fontSize: 15 }}>{t.tee} Tees</div>
                  <div style={{ fontSize: 12, color: "rgba(245,240,232,.45)", marginTop: 2 }}>
                    {t.rating && `Rating ${t.rating}`}{t.rating && t.slope ? "  ·  " : ""}{t.slope && `Slope ${t.slope}`}
                    {t.holes?.some(h => h.yards) && `  ·  ${t.holes.reduce((s, h) => s + (Number(h.yards) || 0), 0).toLocaleString()} yds`}
                  </div>
                </div>
                <span style={{ marginLeft: "auto", color: "var(--gold)", fontSize: 18 }}>›</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  if (view === "manual") return (
    <div style={{ maxWidth: 580, margin: "0 auto", padding: "30px 20px" }}>
      <button className="btn-outline" onClick={() => setView("setup")} style={{ marginBottom: 22 }}>← Back</button>
      <h2 style={{ color: "var(--gold)", fontSize: 24, marginBottom: 20 }}>Course Details</h2>
      <div style={{ marginBottom: 14 }}>
        <label className="field-label">Course Name</label>
        <input className="field-input" placeholder="e.g. Pebble Beach Golf Links" value={round.course}
          onChange={e => setRound(r => ({ ...r, course: e.target.value }))} style={{ fontSize: 14 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          <label className="field-label">Course Rating</label>
          <input className="field-input" placeholder="e.g. 72.4" value={round.rating}
            onChange={e => setRound(r => ({ ...r, rating: e.target.value }))} style={{ fontSize: 13 }} />
        </div>
        <div>
          <label className="field-label">Slope Rating</label>
          <input className="field-input" placeholder="e.g. 131" value={round.slope}
            onChange={e => setRound(r => ({ ...r, slope: e.target.value }))} style={{ fontSize: 13 }} />
        </div>
      </div>
      <div style={{ marginBottom: 22 }}>
        <label className="field-label" style={{ marginBottom: 8 }}>Tees Playing</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TEE_COLORS.map(t => (
            <button key={t} onClick={() => setRound(r => ({ ...r, tee: t }))} style={{
              padding: "7px 14px", borderRadius: 20, border: "1px solid",
              borderColor: round.tee === t ? "var(--gold)" : "var(--border)",
              background: round.tee === t ? "rgba(200,168,75,.15)" : "rgba(255,255,255,.04)",
              color: round.tee === t ? "var(--gold)" : "rgba(245,240,232,.55)",
              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              display: "flex", alignItems: "center", gap: 5, transition: "all .15s",
            }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: teeColor(t), border: "1px solid rgba(255,255,255,.2)" }} />
              {t}
            </button>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 12, color: "rgba(245,240,232,.4)", marginBottom: 16, lineHeight: 1.5 }}>
        You'll enter par, yardage, and handicap for each hole on the scorecard.
      </div>
      <button className="btn-gold" onClick={() => setView("card")} disabled={!round.course.trim()}>
        Continue to Scorecard →
      </button>
      {!round.course.trim() && (
        <div style={{ fontSize: 12, color: "rgba(245,240,232,.35)", marginTop: 8, textAlign: "center" }}>Enter a course name to continue</div>
      )}
    </div>
  );

  return (
    <div style={{ padding: "24px 0 40px" }}>
      {/* Compact round header */}
      <div style={{ padding: "0 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            {round.tee && <div style={{ width: 12, height: 12, borderRadius: "50%", background: teeColor(round.tee), border: "1px solid rgba(255,255,255,.2)", flexShrink: 0 }} />}
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--cream)" }}>{round.course || "Unnamed Course"}</span>
            {round.roundType === "simulator" && (
              <span style={{ fontSize: 10, background: "rgba(74,144,217,.2)", color: "#4a90d9", border: "1px solid rgba(74,144,217,.35)", borderRadius: 10, padding: "2px 8px", fontWeight: 600 }}>SIM</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "rgba(245,240,232,.4)" }}>
            {formatDate(round.date)}{round.tee ? ` · ${round.tee}` : ""}{round.rating ? ` · Rating ${round.rating}` : ""}{round.slope ? ` · Slope ${round.slope}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button className="btn-outline" style={{ fontSize: 10, padding: "5px 10px" }} onClick={() => setView("setup")}>← Setup</button>
          <button className="btn-outline" style={{ fontSize: 10, padding: "5px 10px" }} onClick={() => setView("rounds")}>Rounds</button>
        </div>
      </div>

      {/* Show/Hide Stats button + panel — sits just below the header */}
      <div style={{ padding: "0 20px 10px" }}>
        <button
          onClick={() => setShowManageRows(m => !m)}
          style={{
            width: "100%", padding: "8px", borderRadius: 7, border: "1px solid",
            borderColor: showManageRows ? "var(--gold)" : "var(--border)",
            background: showManageRows ? "rgba(200,168,75,.1)" : "rgba(255,255,255,.04)",
            color: showManageRows ? "var(--gold)" : "rgba(245,240,232,.5)",
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 12,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "all .15s",
          }}>
          <span>{showManageRows ? "▲" : "▼"}</span>
          Show / Hide Stats
          {hiddenRows.length > 0 && (
            <span style={{ background: "var(--gold)", color: "var(--green-deep)", borderRadius: 10, fontSize: 10, padding: "1px 7px", fontWeight: 700 }}>
              {hiddenRows.length} hidden
            </span>
          )}
        </button>
        {showManageRows && (
          <div style={{ marginTop: 8, background: "rgba(0,0,0,.2)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {ROWS.filter(r => !REQUIRED_ROWS.includes(r.key)).map(r => {
                const hidden = hiddenRows.includes(r.key);
                return (
                  <button key={r.key} onClick={() => toggleHideRow(r.key)} style={{
                    padding: "7px 14px", borderRadius: 20, border: "1px solid",
                    borderColor: hidden ? "rgba(255,255,255,.1)" : "var(--gold)",
                    background: hidden ? "rgba(255,255,255,.03)" : "rgba(200,168,75,.12)",
                    color: hidden ? "rgba(245,240,232,.25)" : "var(--gold)",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif", transition: "all .15s",
                    textDecoration: hidden ? "line-through" : "none",
                  }}>
                    {r.label.replace('\n', ' ')}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: "rgba(245,240,232,.25)", marginTop: 10 }}>
              Par and Score always visible. Preferences are saved.
            </div>
          </div>
        )}
      </div>
      {round.course.trim() && (
        <div style={{ padding: "0 20px 10px" }}>
          <button onClick={() => setShowSaveCourse(true)} style={{
            width: "100%", background: "rgba(200,168,75,.07)", border: "1px solid var(--border)",
            borderRadius: 7, color: "var(--gold)", fontSize: 11, fontWeight: 600,
            padding: "7px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
          }}>💾 Save Course to Library</button>
        </div>
      )}
      {showSaveCourse && (
        <div style={{ margin: "0 20px 12px", background: "linear-gradient(135deg, rgba(200,168,75,.12), rgba(200,168,75,.04))", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 13, color: "var(--cream)", marginBottom: 12 }}>
            Save <strong style={{ color: "var(--gold)" }}>{round.course}</strong>{round.tee ? ` — ${round.tee} Tees` : ""} to your course library?
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-gold" style={{ padding: "8px 18px" }} onClick={saveCourse}>Save</button>
            <button className="btn-outline" style={{ padding: "8px 18px" }} onClick={() => setShowSaveCourse(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Scrollable scorecard grid */}
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}>
        <div style={{ minWidth: labelW + (colW * 18) + (totW * 3) + 20, paddingLeft: 12 }}>

          {/* Hole number header row */}
          <div style={rowStyle(true)}>
            <div style={{ width: labelW, minWidth: labelW, fontSize: 11, fontWeight: 700, color: "var(--gold)", paddingLeft: 6 }}>Hole</div>
            {round.holes.map((_, i) => (
              <div key={i} style={{ width: colW, minWidth: colW, ...cellBase, fontWeight: 800,
                color: i < 9 ? "var(--gold-light)" : "rgba(200,168,75,.7)",
                borderLeft: i === 9 ? "2px solid rgba(200,168,75,.3)" : "none" }}>
                {i + 1}
              </div>
            ))}
            <div style={{ width: totW, minWidth: totW, ...cellBase, borderLeft: "2px solid rgba(200,168,75,.3)", fontSize: 10, color: "var(--gold)", fontWeight: 700 }}>OUT</div>
            <div style={{ width: totW, minWidth: totW, ...cellBase, borderLeft: "1px solid rgba(200,168,75,.15)", fontSize: 10, color: "var(--gold)", fontWeight: 700 }}>IN</div>
            <div style={{ width: totW, minWidth: totW, ...cellBase, borderLeft: "1px solid rgba(200,168,75,.15)", fontSize: 10, color: "var(--gold)", fontWeight: 700 }}>TOT</div>
          </div>

          {/* Data rows */}
          {visibleRows.map((row, ri) => (
            <div key={row.key} style={{ ...rowStyle(false), background: ri % 2 === 0 ? "rgba(0,0,0,.1)" : "transparent" }}>
              {/* Row label */}
              <div style={{ width: labelW, minWidth: labelW, fontWeight: 700,
                color: "rgba(245,240,232,.5)", textTransform: "uppercase", letterSpacing: ".4px",
                paddingLeft: 6, flexShrink: 0,
                fontSize: row.smallLabel ? 8 : 10,
                lineHeight: row.smallLabel ? 1.3 : "inherit",
                whiteSpace: row.smallLabel ? "pre-line" : "nowrap",
              }}>
                {row.label}
              </div>

              {/* 18 hole cells */}
              {round.holes.map((hole, hi) => {
                const scoreDiff = hole.score !== "" ? Number(hole.score) - hole.par : null;
                return (
                  <div key={hi} style={{
                    width: colW, minWidth: colW, display: "flex", alignItems: "center",
                    justifyContent: "center", padding: "3px 2px",
                    borderLeft: hi === 9 ? "2px solid rgba(200,168,75,.3)" : "none",
                  }}>
                    {row.type === "input" && (
                      row.par3hide && hole.par === 3
                        ? <span style={{ color: "rgba(245,240,232,.15)", fontSize: 11 }}>—</span>
                        : <ScorecardInput
                            value={hole[row.key]}
                            onChange={v => updateHole(hi, row.key, v)}
                            min={row.key === "yards" || row.key === "driveYards" ? 50 : 0}
                            max={row.key === "yards" || row.key === "driveYards" ? 400 : 20}
                            width={row.inputWidth}
                          />
                    )}
                    {row.type === "par" && (
                      <select value={hole.par} onChange={e => updateHole(hi, "par", Number(e.target.value))} style={{
                        background: "transparent", border: "none", color: "var(--cream)",
                        fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif",
                        cursor: "pointer", textAlign: "center", width: 32,
                      }}>
                        {[3,4,5].map(p => <option key={p} value={p} style={{ background: "#1a4731" }}>{p}</option>)}
                      </select>
                    )}
                    {row.type === "score" && (
                      <input
                        type="number" min="1" max="20"
                        value={hole.score}
                        onChange={e => updateHole(hi, "score", e.target.value)}
                        placeholder="—"
                        style={{
                          width: 34, textAlign: "center",
                          background: scoreDiff !== null ? (
                            scoreDiff <= -2 ? "rgba(255,215,0,.2)"  :
                            scoreDiff === -1 ? "rgba(76,175,120,.25)" :
                            scoreDiff === 0  ? "rgba(255,255,255,.08)" :
                            scoreDiff === 1  ? "rgba(224,154,74,.2)"  :
                            "rgba(224,80,80,.2)"
                          ) : "rgba(0,0,0,.25)",
                          border: `1px solid ${scoreColor(scoreDiff)}44`,
                          borderRadius: 4,
                          color: scoreColor(scoreDiff),
                          fontSize: 13, fontWeight: 800, padding: "3px 0",
                          fontFamily: "'DM Sans',sans-serif", outline: "none", height: 28,
                        }}
                      />
                    )}
                    {row.type === "check" && (
                      <CheckCell
                        checked={hole[row.key]}
                        onToggle={() => updateHole(hi, row.key, !hole[row.key])}
                        disabled={row.key === "fairway" && hole.par === 3}
                      />
                    )}
                  </div>
                );
              })}

              {/* Out / In / Total columns */}
              {["front","back","all"].map((seg, si) => {
                const segHoles = seg === "front" ? round.holes.slice(0,9) : seg === "back" ? round.holes.slice(9) : round.holes;
                const display  = totalsDisplay(row.key, segHoles);
                const isScore  = row.key === "score";
                const diff     = isScore ? calcStats(segHoles).diff : null;
                return (
                  <div key={seg} style={{
                    width: totW, minWidth: totW, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 11, fontWeight: 700, padding: "3px 2px",
                    color: isScore ? scoreColor(diff) : "rgba(245,240,232,.7)",
                    borderLeft: si === 0 ? "2px solid rgba(200,168,75,.3)" : "1px solid rgba(200,168,75,.15)",
                    background: "rgba(0,0,0,.15)",
                  }}>
                    {display}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Stats summary + Save Round — always visible */}
      <div style={{ padding: "16px 20px 0" }}>
        {allStats.played > 0 && (
          <div style={{
            background: "linear-gradient(135deg, rgba(200,168,75,.12), rgba(200,168,75,.05))",
            border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", marginBottom: 16,
            display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6,
          }}>
            {[
              { label: "Score",  value: allStats.total, sub: diffLabel(allStats.diff) },
              { label: "FWY %",  value: allStats.fwPct  !== null ? `${allStats.fwPct}%`  : "—", sub: "" },
              { label: "GIR %",  value: allStats.girPct !== null ? `${allStats.girPct}%` : "—", sub: "" },
              { label: "Putts",  value: allStats.totalPutts !== null ? allStats.totalPutts : "—", sub: allStats.puttsAvg ? `${allStats.puttsAvg}/hole` : "" },
              { label: "Pen.",   value: allStats.penalties ?? 0, sub: "" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "var(--gold)", lineHeight: 1 }}>{s.value}</div>
                {s.sub && <div style={{ fontSize: 10, color: "rgba(245,240,232,.4)", marginTop: 1 }}>{s.sub}</div>}
                <div style={{ fontSize: 9, color: "rgba(245,240,232,.35)", marginTop: 2, textTransform: "uppercase", letterSpacing: ".3px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
        <button
          className="btn-gold"
          onClick={saveRound}
          disabled={!round.holes.some(h => h.score !== "")}
        >
          {editingId ? "💾 Save Changes" : "💾 Save Round"}
        </button>
        {!round.holes.some(h => h.score !== "") && (
          <p style={{ fontSize: 12, color: "rgba(245,240,232,.35)", marginTop: 8, textAlign: "center" }}>
            Enter at least one score to save the round
          </p>
        )}
      </div>
    </div>
  );
}


// ── History ───────────────────────────────────────────────────────────────────
function History({ history, clear }) {
  const ICONS = { lesson: "📚", swing: "🏌", caddy: "🧍" };
  if (!history.length) return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 14 }}>📋</div>
      <h2 style={{ color: "var(--gold)", marginBottom: 10 }}>No history yet</h2>
      <p style={{ color: "rgba(245,240,232,.45)" }}>Your sessions will appear here as you work toward scratch.</p>
    </div>
  );
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "30px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <h2 style={{ color: "var(--gold)", fontSize: 26 }}>Your History</h2>
        <button className="btn-outline" onClick={clear} style={{ fontSize: 12 }}>Clear All</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[...history].reverse().map((item, i) => (
          <div key={i} className="card fade-up" style={{ padding: "15px 18px", display: "flex", gap: 13, animationDelay: `${i * 0.04}s` }}>
            <span style={{ fontSize: 22, marginTop: 2 }}>{ICONS[item.type]}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</span>
                <span style={{ fontSize: 11, color: "rgba(245,240,232,.35)" }}>{item.date}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--gold)", margin: "2px 0" }}>with {item.coach}</div>
              <div style={{ fontSize: 13, color: "rgba(245,240,232,.5)", lineHeight: 1.5 }}>{item.preview}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Analytics ─────────────────────────────────────────────────────────────────

// WHS Handicap Index calculation (simplified)
// Uses best 8 of last 20 score differentials
function calcDifferential(score, rating, slope) {
  if (!score || !rating || !slope) return null;
  return ((Number(score) - Number(rating)) * 113) / Number(slope);
}

function calcHandicapIndex(rounds) {
  const diffs = rounds
    .map(r => {
      const stats = calcStats(r.holes);
      return calcDifferential(stats.total, r.rating, r.slope);
    })
    .filter(d => d !== null)
    .sort((a, b) => a - b);

  if (diffs.length < 3) return null;

  // WHS: use best differentials based on count
  const useCount =
    diffs.length >= 20 ? 8 :
    diffs.length >= 17 ? 7 :
    diffs.length >= 14 ? 6 :
    diffs.length >= 11 ? 5 :
    diffs.length >= 9  ? 4 :
    diffs.length >= 7  ? 3 :
    diffs.length >= 5  ? 2 : 1;

  const best = diffs.slice(0, useCount);
  const avg  = best.reduce((s, d) => s + d, 0) / best.length;
  return Math.round(avg * 10) / 10; // 1 decimal
}

// Mini bar chart
function BarChart({ data, color = "var(--gold)", maxVal, label, format = v => v }) {
  const max = maxVal || Math.max(...data.map(d => d.value), 1);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 60, marginBottom: 4 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <div style={{ fontSize: 9, color: "rgba(245,240,232,.4)", marginBottom: 2 }}>
              {format(d.value)}
            </div>
            <div style={{
              width: "100%", background: color, borderRadius: "3px 3px 0 0",
              height: `${Math.max((d.value / max) * 48, d.value > 0 ? 4 : 0)}px`,
              transition: "height .3s",
              opacity: i === data.length - 1 ? 1 : 0.6 + (i / data.length) * 0.4,
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 3 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 8, color: "rgba(245,240,232,.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// Horizontal stat bar
function StatBar({ label, value, max, color, format = v => `${v}%` }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: "rgba(245,240,232,.65)" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{format(value)}</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,.08)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width .5s" }} />
      </div>
    </div>
  );
}

// Small stat card
function StatCard({ label, value, sub, color = "var(--gold)", trend }) {
  return (
    <div style={{
      background: "var(--card-bg)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "12px 14px", textAlign: "center",
    }}>
      <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "rgba(245,240,232,.4)", marginTop: 2 }}>{sub}</div>}
      <div style={{ fontSize: 10, color: "rgba(245,240,232,.45)", marginTop: 4, textTransform: "uppercase", letterSpacing: ".3px" }}>{label}</div>
      {trend !== undefined && (
        <div style={{ fontSize: 10, marginTop: 3, color: trend < 0 ? "#4caf78" : trend > 0 ? "#e05c5c" : "rgba(245,240,232,.3)" }}>
          {trend < 0 ? `▼ ${Math.abs(trend)}` : trend > 0 ? `▲ ${trend}` : "—"}
        </div>
      )}
    </div>
  );
}


function Analytics({ savedRounds, coach, rangeSessions = [] }) {
  const [tab, setTab]       = useState("overview");
  const [source, setSource] = useState("course");
  const [limit, setLimit]   = useState("all"); // "all" | "10" | "5"
  const [analysis, setAnalysis]         = useState("");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError]     = useState("");

  const courseRounds = savedRounds.filter(r => (r.roundType || "course") === "course");
  const simRounds    = savedRounds.filter(r => r.roundType === "simulator");
  const sourceRounds = source === "all" ? savedRounds : source === "simulator" ? simRounds : courseRounds;
  const filteredRounds = limit === "all" ? sourceRounds : sourceRounds.slice(0, Number(limit));

  async function getAnalysis() {
    setAnalysisLoading(true); setAnalysis(""); setAnalysisError("");
    try {
      const stats = calcStats(filteredRounds.flatMap(r => r.holes));
      const hcp = calcHandicapIndex(courseRounds);
      const summaries = filteredRounds.slice(0, 10).map(r => {
        const s = calcStats(r.holes);
        return formatDate(r.date) + ": score " + s.total + " (" + diffLabel(s.diff) + "), FWY " + (s.fwPct != null ? s.fwPct : "?") + "%, GIR " + (s.girPct != null ? s.girPct : "?") + "%, putts " + (s.totalPutts != null ? s.totalPutts : "?");
      }).join("\n");
      const system = "You are " + coach.name + ", an AI golf coach (" + coach.style + "). " + coach.desc + " Give a thorough written coaching analysis covering: current level, trends, strengths, biggest opportunities, and recommended drills. Be specific and use the actual numbers. Write in flowing paragraphs.";
      const prompt = "My round data (" + filteredRounds.length + " rounds):\nHandicap Index: " + (hcp != null ? hcp : "N/A") + "\nAvg FWY: " + (stats.fwPct != null ? stats.fwPct + "%" : "?") + "\nAvg GIR: " + (stats.girPct != null ? stats.girPct + "%" : "?") + "\nRecent rounds:\n" + summaries + "\n\nPlease give me a thorough coaching analysis.";
      const result = await askClaude({ system, messages: [{ role: "user", content: prompt }] });
      setAnalysis(result);
    } catch (e) {
      setAnalysisError("Couldn't generate analysis — check your connection and try again.");
    } finally {
      setAnalysisLoading(false);
    }
  }

  if (savedRounds.length === 0) return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>📈</div>
      <h2 style={{ color: "var(--gold)", marginBottom: 10 }}>Game Analytics</h2>
      <p style={{ color: "rgba(245,240,232,.5)", lineHeight: 1.6 }}>Save a round from the Scorecard to unlock your handicap, stat trends, and performance charts.</p>
    </div>
  );

  const rounds     = [...filteredRounds].reverse();
  const roundStats = rounds.map(r => Object.assign({}, calcStats(r.holes), { round: r }));

  const hcpIndex = calcHandicapIndex(courseRounds);
  const prevHcp  = courseRounds.length > 1 ? calcHandicapIndex(courseRounds.slice(1)) : null;
  const hcpTrend = hcpIndex != null && prevHcp != null ? Math.round((hcpIndex - prevHcp) * 10) / 10 : undefined;

  const avg = function(key) {
    const vals = roundStats.map(function(s) { return s[key]; }).filter(function(v) { return v != null; });
    return vals.length ? Math.round(vals.reduce(function(a, b) { return a + b; }, 0) / vals.length) : null;
  };
  const avgScore  = avg("total");
  const avgFwPct  = avg("fwPct");
  const avgGirPct = avg("girPct");
  const avgPutts  = (function() {
    const vals = roundStats.map(function(s) { return s.totalPutts; }).filter(function(v) { return v != null; });
    return vals.length ? Math.round(vals.reduce(function(a, b) { return a + b; }, 0) / vals.length) : null;
  })();

  const last10 = roundStats.slice(-10);
  const scoreTrend = last10.map(function(s, i) { return { label: "R" + (roundStats.length - last10.length + i + 1), value: (s.diff || 0) }; });
  const last8 = roundStats.slice(-8);
  const fwTrend     = last8.map(function(s, i) { return { label: "R" + (roundStats.length - last8.length + i + 1), value: (s.fwPct || 0) }; });
  const girTrend    = last8.map(function(s, i) { return { label: "R" + (roundStats.length - last8.length + i + 1), value: (s.girPct || 0) }; });
  const puttsTrend  = last8.map(function(s, i) { return { label: "R" + (roundStats.length - last8.length + i + 1), value: (s.totalPutts || 0) }; });
  const penaltyTrend = last8.map(function(s, i) { return { label: "R" + (roundStats.length - last8.length + i + 1), value: (s.penalties || 0) }; });
  const sandTrend   = last8.map(function(s, i) { return { label: "R" + (roundStats.length - last8.length + i + 1), value: (s.sand || 0) }; });

  const validScores = roundStats.filter(function(s) { return s.played >= 9; });
  const bestRound   = validScores.length ? validScores.reduce(function(a, b) { return a.diff < b.diff ? a : b; }) : null;
  const worstRound  = validScores.length ? validScores.reduce(function(a, b) { return a.diff > b.diff ? a : b; }) : null;

  const scoring = { eagle: 0, birdie: 0, par: 0, bogey: 0, double: 0 };
  filteredRounds.forEach(function(r) {
    r.holes.forEach(function(h) {
      if (h.score === "" || isNaN(h.score)) return;
      const d = Number(h.score) - h.par;
      if (d <= -2) scoring.eagle++;
      else if (d === -1) scoring.birdie++;
      else if (d === 0) scoring.par++;
      else if (d === 1) scoring.bogey++;
      else scoring.double++;
    });
  });
  const totalHoles = Object.values(scoring).reduce(function(a, b) { return a + b; }, 0);

  const TABS = ["overview", "scoring", "approach", "short game", "putting", "range"];

  const allSandHoles = filteredRounds.flatMap(function(r) { return r.holes.filter(function(h) { return Number(h.sand) > 0 && h.score !== ""; }); });
  const sandSaves    = allSandHoles.filter(function(h) { return Number(h.score) <= h.par; });
  const sandSavePct  = allSandHoles.length ? Math.round(sandSaves.length / allSandHoles.length * 100) : null;
  const nonGirHoles  = filteredRounds.flatMap(function(r) { return r.holes.filter(function(h) { return !h.gir && h.score !== ""; }); });
  const upAndDowns   = nonGirHoles.filter(function(h) { return Number(h.score) <= h.par; });
  const upAndDownPct = nonGirHoles.length ? Math.round(upAndDowns.length / nonGirHoles.length * 100) : null;
  const avgSandPerRound = (function() {
    const vals = filteredRounds.map(function(r) { return r.holes.reduce(function(s, h) { return s + (Number(h.sand) || 0); }, 0); }).filter(function(v) { return v > 0; });
    return vals.length ? (vals.reduce(function(a, b) { return a + b; }, 0) / vals.length).toFixed(1) : null;
  })();
  const avgPenalties = (function() {
    const vals = roundStats.map(function(s) { return s.penalties; }).filter(function(v) { return v != null; });
    return vals.length ? (vals.reduce(function(a, b) { return a + b; }, 0) / vals.length).toFixed(1) : null;
  })();
  const totalPenalties   = filteredRounds.reduce(function(s, r) { return s + r.holes.reduce(function(a, h) { return a + (Number(h.penalties) || 0); }, 0); }, 0);
  const holesWithPenalty = filteredRounds.flatMap(function(r) { return r.holes.filter(function(h) { return Number(h.penalties) > 0; }); });
  const penaltyOnParTypes = [3, 4, 5].map(function(par) { return { par: par, count: holesWithPenalty.filter(function(h) { return h.par === par; }).length }; });

  const simCourseCorr = (function() {
    if (courseRounds.length < 2 || simRounds.length < 2) return null;
    const rc = courseRounds.slice(0, 5);
    const rs = simRounds.slice(0, 5);
    const ca = rc.reduce(function(s, r) { return s + (calcStats(r.holes).diff || 0); }, 0) / rc.length;
    const sa = rs.reduce(function(s, r) { return s + (calcStats(r.holes).diff || 0); }, 0) / rs.length;
    return { courseAvg: Math.round(ca * 10) / 10, simAvg: Math.round(sa * 10) / 10 };
  })();

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "30px 20px" }}>
      <h2 className="fade-up" style={{ color: "var(--gold)", fontSize: 28, marginBottom: 6 }}>Game Analytics</h2>
      <p className="fade-up" style={{ color: "rgba(245,240,232,.5)", marginBottom: 16, fontSize: 13 }}>
        {savedRounds.length} round{savedRounds.length !== 1 ? "s" : ""} tracked &middot; {coach.emoji} {coach.name}
      </p>

      <div className="fade-up" style={{ display: "flex", gap: 6, marginBottom: 10, background: "rgba(0,0,0,.2)", borderRadius: 10, padding: 4 }}>
        {[
          { value: "course",    icon: "⛳", label: "Course",    count: courseRounds.length },
          { value: "simulator", icon: "🖥", label: "Simulator", count: simRounds.length },
          { value: "all",       icon: "📊", label: "All",       count: savedRounds.length },
        ].map(function(opt) { return (
          <button key={opt.value} onClick={function() { setSource(opt.value); }} style={{
            flex: 1, padding: "8px 6px", borderRadius: 7, border: "none",
            background: source === opt.value ? "rgba(200,168,75,.2)" : "transparent",
            color: source === opt.value ? "var(--gold)" : "rgba(245,240,232,.45)",
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
            fontSize: 12, transition: "all .15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          }}>
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
            <span style={{ background: source === opt.value ? "var(--gold)" : "rgba(255,255,255,.1)", color: source === opt.value ? "var(--green-deep)" : "rgba(245,240,232,.4)", borderRadius: 10, fontSize: 10, padding: "1px 6px", fontWeight: 700 }}>{opt.count}</span>
          </button>
        ); })}
      </div>

      {/* Round limit filter */}
      <div className="fade-up" style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[
          { value: "all", label: "All rounds" },
          { value: "10",  label: "Last 10" },
          { value: "5",   label: "Last 5" },
        ].map(opt => (
          <button key={opt.value} onClick={() => setLimit(opt.value)} style={{
            flex: 1, padding: "7px 4px", borderRadius: 7, border: "1px solid",
            borderColor: limit === opt.value ? "var(--gold)" : "var(--border)",
            background: limit === opt.value ? "rgba(200,168,75,.12)" : "transparent",
            color: limit === opt.value ? "var(--gold)" : "rgba(245,240,232,.4)",
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
            fontSize: 11, transition: "all .15s",
          }}>{opt.label}</button>
        ))}
      </div>

      {filteredRounds.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(245,240,232,.4)", fontSize: 14 }}>
          No {source === "simulator" ? "simulator" : "course"} rounds saved yet.
        </div>
      )}

      {filteredRounds.length > 0 && (
      <div>
        <div className="fade-up" style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {TABS.map(function(t) { return (
            <button key={t} onClick={function() { setTab(t); }} style={{
              flex: 1, padding: "8px 4px", borderRadius: 8, border: "1px solid",
              borderColor: tab === t ? "var(--gold)" : "var(--border)",
              background: tab === t ? "rgba(200,168,75,.14)" : "transparent",
              color: tab === t ? "var(--gold)" : "rgba(245,240,232,.45)",
              fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              textTransform: "capitalize", transition: "all .15s",
            }}>{t}</button>
          ); })}
        </div>

        {tab === "overview" && (
          <div className="fade-up">
            <div style={{ background: "linear-gradient(135deg, rgba(200,168,75,.18), rgba(200,168,75,.06))", border: "1px solid var(--border)", borderRadius: 14, padding: "20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 11, color: "rgba(245,240,232,.5)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4 }}>Handicap Index (WHS)</div>
                <div style={{ fontSize: 48, fontWeight: 900, color: "var(--gold)", lineHeight: 1 }}>{hcpIndex != null ? hcpIndex : "—"}</div>
                {hcpIndex == null && <div style={{ fontSize: 12, color: "rgba(245,240,232,.4)", marginTop: 4 }}>{courseRounds.length < 3 ? (3 - courseRounds.length) + " more course round" + (3 - courseRounds.length !== 1 ? "s" : "") + " needed" : "Add rating & slope to rounds"}</div>}
                {hcpTrend !== undefined && <div style={{ fontSize: 12, marginTop: 4, color: hcpTrend < 0 ? "#4caf78" : hcpTrend > 0 ? "#e05c5c" : "rgba(245,240,232,.4)" }}>{hcpTrend < 0 ? "▼ " + Math.abs(hcpTrend) + " improving" : hcpTrend > 0 ? "▲ " + hcpTrend + " rising" : "No change"}</div>}
                <div style={{ fontSize: 10, color: "rgba(245,240,232,.3)", marginTop: 4 }}>Course rounds only &middot; Sim excluded</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "rgba(245,240,232,.4)", marginBottom: 8 }}>Based on {Math.min(courseRounds.length, 20)} course rounds</div>
                {bestRound && <div style={{ fontSize: 12, color: "var(--green-light)" }}>Best: {bestRound.total} ({diffLabel(bestRound.diff)})</div>}
                {worstRound && <div style={{ fontSize: 12, color: "rgba(245,240,232,.4)", marginTop: 2 }}>{worstRound.round.course || "Round"} &middot; {formatDate(worstRound.round.date)}</div>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
              <StatCard label="Avg Score" value={avgScore != null ? avgScore : "—"} color="var(--gold)" />
              <StatCard label="FWY %" value={avgFwPct != null ? avgFwPct + "%" : "—"} color="#4caf78" />
              <StatCard label="GIR %" value={avgGirPct != null ? avgGirPct + "%" : "—"} color="#4a90d9" />
              <StatCard label="Avg Putts" value={avgPutts != null ? avgPutts : "—"} color="#c8763a" />
            </div>

            <div className="card" style={{ padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 14 }}>Score vs Par — Recent Rounds</div>
              <BarChart data={scoreTrend.map(function(d) { return { label: d.label, value: Math.max(d.value + 36, 1) }; })} color="var(--gold)" format={function(v) { return diffLabel(v - 36); }} />
              <div style={{ fontSize: 10, color: "rgba(245,240,232,.3)", marginTop: 8, textAlign: "center" }}>Lower = better &middot; Gold = most recent</div>
            </div>

            <div className="card" style={{ padding: "16px 18px", marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 14 }}>Scoring Distribution</div>
              {totalHoles > 0 && [
                { key: "eagle",  label: "Eagle or better", color: "#ffd700" },
                { key: "birdie", label: "Birdie",           color: "#4caf78" },
                { key: "par",    label: "Par",              color: "var(--cream)" },
                { key: "bogey",  label: "Bogey",            color: "#e09a4a" },
                { key: "double", label: "Double+",          color: "#e05c5c" },
              ].map(function(item) { return (
                <StatBar key={item.key} label={item.label + " (" + scoring[item.key] + ")"} value={Math.round(scoring[item.key] / totalHoles * 100)} max={100} color={item.color} format={function(v) { return v + "%"; }} />
              ); })}
            </div>

            {simCourseCorr && (
              <div className="card" style={{ padding: "16px 18px", marginBottom: 20, border: "1px solid rgba(74,144,217,.25)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#4a90d9", marginBottom: 12 }}>Simulator vs Course Correlation</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div style={{ background: "rgba(74,144,217,.1)", border: "1px solid rgba(74,144,217,.25)", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#4a90d9", marginBottom: 4, fontWeight: 600 }}>Simulator</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: scoreColor(simCourseCorr.simAvg) }}>{diffLabel(simCourseCorr.simAvg)}</div>
                    <div style={{ fontSize: 10, color: "rgba(245,240,232,.35)", marginTop: 2 }}>avg vs par</div>
                  </div>
                  <div style={{ background: "rgba(76,175,120,.1)", border: "1px solid rgba(76,175,120,.25)", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#4caf78", marginBottom: 4, fontWeight: 600 }}>Course</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: scoreColor(simCourseCorr.courseAvg) }}>{diffLabel(simCourseCorr.courseAvg)}</div>
                    <div style={{ fontSize: 10, color: "rgba(245,240,232,.35)", marginTop: 2 }}>avg vs par</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "rgba(245,240,232,.4)", lineHeight: 1.6 }}>
                  {(function() {
                    const gap = simCourseCorr.courseAvg - simCourseCorr.simAvg;
                    if (Math.abs(gap) < 1) return "Your sim and course scores are closely aligned.";
                    if (gap > 0) return "Your course scores run about " + Math.abs(gap).toFixed(1) + " strokes higher than sim — common due to course conditions and pressure.";
                    return "Interestingly you score better on course than sim — your real-world course management may be a strength.";
                  })()}
                </div>
              </div>
            )}

            <div style={{ background: "linear-gradient(135deg, rgba(200,168,75,.12), rgba(200,168,75,.05))", border: "1px solid var(--border)", borderRadius: 14, padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>{coach.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--gold)", fontSize: 14 }}>{coach.name}'s Coaching Report</div>
                  <div style={{ fontSize: 12, color: "rgba(245,240,232,.45)" }}>Full analysis based on your round history</div>
                </div>
              </div>
              {!analysis && !analysisLoading && <button className="btn-gold" onClick={getAnalysis} style={{ marginTop: 4 }}>Get My Coaching Report</button>}
              {analysisLoading && <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, color: "rgba(245,240,232,.6)", fontSize: 13 }}><div className="spinner" /> {coach.name} is reviewing your game…</div>}
              {analysisError && <div style={{ fontSize: 13, color: "#f87171", marginTop: 6 }}>{analysisError}</div>}
              {analysis && (
                <div>
                  <div style={{ background: "linear-gradient(135deg, var(--green-mid), var(--green-bright))", border: "1px solid var(--border)", borderRadius: "12px 12px 12px 4px", padding: "16px 18px", fontSize: 14, lineHeight: 1.75, whiteSpace: "pre-wrap", marginTop: 6, marginBottom: 14 }}>{analysis}</div>
                  <button className="btn-gold" onClick={getAnalysis} style={{ flex: 1 }}>Refresh Analysis</button>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "scoring" && (
          <div className="fade-up">
            <div className="card" style={{ padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 4 }}>Score Trend</div>
              <div style={{ fontSize: 11, color: "rgba(245,240,232,.4)", marginBottom: 14 }}>Your last {scoreTrend.length} rounds vs par</div>
              <BarChart data={scoreTrend.map(function(d) { return { label: d.label, value: Math.max(d.value + 36, 1) }; })} color="var(--gold)" format={function(v) { return diffLabel(v - 36); }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div className="card" style={{ padding: "14px" }}>
                <div style={{ fontSize: 11, color: "rgba(245,240,232,.45)", marginBottom: 10 }}>Hole-by-Hole Average</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 50 }}>
                  {Array.from({ length: 18 }, function(_, i) {
                    const scores = filteredRounds.map(function(r) { return r.holes[i]; }).filter(function(h) { return h && h.score !== ""; }).map(function(h) { return Number(h.score) - h.par; });
                    const a = scores.length ? scores.reduce(function(x, y) { return x + y; }, 0) / scores.length : 0;
                    const ht = Math.max(Math.abs(a) * 10, 2);
                    return <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}><div style={{ width: "100%", height: ht + "px", background: a < 0 ? "#4caf78" : a === 0 ? "rgba(255,255,255,.3)" : a < 1 ? "#e09a4a" : "#e05c5c", borderRadius: 2 }} /></div>;
                  })}
                </div>
                <div style={{ fontSize: 9, color: "rgba(245,240,232,.3)", marginTop: 4, textAlign: "center" }}>Holes 1-18 avg vs par</div>
              </div>
              <div className="card" style={{ padding: "14px" }}>
                <div style={{ fontSize: 11, color: "rgba(245,240,232,.45)", marginBottom: 10 }}>Par Breakdown</div>
                {[3, 4, 5].map(function(par) {
                  const holes = filteredRounds.flatMap(function(r) { return r.holes.filter(function(h) { return h.par === par && h.score !== ""; }); });
                  const a = holes.length ? holes.reduce(function(s, h) { return s + Number(h.score); }, 0) / holes.length : null;
                  const d = a != null ? a - par : null;
                  return (
                    <div key={par} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: "rgba(245,240,232,.6)" }}>Par {par}s ({holes.length})</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(d) }}>{a != null ? a.toFixed(1) + " (" + diffLabel(Math.round(d * 10) / 10) + ")" : "—"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="card" style={{ padding: "16px 18px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 12 }}>Round Log</div>
              {filteredRounds.map(function(r, i) {
                const s = calcStats(r.holes);
                return (
                  <div key={r.id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, marginBottom: 8, borderBottom: i < filteredRounds.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{r.course || "Unnamed Course"}</div>
                      <div style={{ fontSize: 11, color: "rgba(245,240,232,.4)" }}>{formatDate(r.date)}{r.tee ? " · " + r.tee : ""}{r.roundType === "simulator" ? " · SIM" : ""}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: scoreColor(s.diff) }}>{s.total || "—"}</span>
                      <span style={{ fontSize: 11, color: "rgba(245,240,232,.4)", marginLeft: 6 }}>{diffLabel(s.diff)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "approach" && (
          <div className="fade-up">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <StatCard label="Avg FWY %" value={avgFwPct != null ? avgFwPct + "%" : "—"} color="#4caf78" sub="Fairways hit" />
              <StatCard label="Avg GIR %" value={avgGirPct != null ? avgGirPct + "%" : "—"} color="#4a90d9" sub="Greens in reg." />
            </div>
            <div className="card" style={{ padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#4caf78", marginBottom: 14 }}>Fairway % Trend</div>
              <BarChart data={fwTrend} color="#4caf78" maxVal={100} format={function(v) { return v + "%"; }} />
            </div>
            <div className="card" style={{ padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#4a90d9", marginBottom: 14 }}>GIR % Trend</div>
              <BarChart data={girTrend} color="#4a90d9" maxVal={100} format={function(v) { return v + "%"; }} />
            </div>
            <div className="card" style={{ padding: "16px 18px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 14 }}>Scoring from GIR vs. Non-GIR</div>
              {["GIR", "Non-GIR"].map(function(type) {
                const holes = filteredRounds.flatMap(function(r) { return r.holes.filter(function(h) { return h.score !== "" && (type === "GIR" ? h.gir : !h.gir); }); });
                const a = holes.length ? holes.reduce(function(s, h) { return s + Number(h.score) - h.par; }, 0) / holes.length : null;
                return (
                  <div key={type} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                    <span style={{ fontSize: 13, color: "rgba(245,240,232,.7)" }}>{type} ({holes.length} holes)</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: scoreColor(a) }}>{a != null ? diffLabel(Math.round(a * 10) / 10) + " avg" : "—"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "short game" && (
          <div className="fade-up">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <StatCard label="Sand Save %" value={sandSavePct != null ? sandSavePct + "%" : "—"} sub={sandSaves.length + "/" + allSandHoles.length + " saves"} color="#e8c96a" />
              <StatCard label="Scrambling %" value={upAndDownPct != null ? upAndDownPct + "%" : "—"} sub={upAndDowns.length + "/" + nonGirHoles.length + " up & downs"} color="#4caf78" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <StatCard label="Avg Sand/Round" value={avgSandPerRound != null ? avgSandPerRound : "—"} sub="Strokes from sand" color="#c8a84b" />
              <StatCard label="Avg Penalties" value={avgPenalties != null ? avgPenalties : "—"} sub={totalPenalties + " total strokes"} color="#e05c5c" />
            </div>
            {allSandHoles.length > 0 && (
              <div className="card" style={{ padding: "16px 18px", marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#e8c96a", marginBottom: 14 }}>Sand Strokes Per Round</div>
                <BarChart data={sandTrend} color="#e8c96a" format={function(v) { return String(v); }} />
              </div>
            )}
            <div className="card" style={{ padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#4caf78", marginBottom: 14 }}>Scrambling by Par Type</div>
              {[3, 4, 5].map(function(par) {
                const ngp = nonGirHoles.filter(function(h) { return h.par === par; });
                const sp  = ngp.filter(function(h) { return Number(h.score) <= h.par; });
                const pct = ngp.length ? Math.round(sp.length / ngp.length * 100) : null;
                return (
                  <div key={par} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: "rgba(245,240,232,.65)" }}>Par {par} missed GIR ({ngp.length} holes)</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: pct != null ? (pct >= 50 ? "#4caf78" : pct >= 30 ? "#e09a4a" : "#e05c5c") : "rgba(245,240,232,.3)" }}>{pct != null ? pct + "%" : "—"}</span>
                    </div>
                    {pct != null && <div style={{ height: 6, background: "rgba(255,255,255,.08)", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: pct + "%", background: pct >= 50 ? "#4caf78" : pct >= 30 ? "#e09a4a" : "#e05c5c", borderRadius: 3 }} /></div>}
                  </div>
                );
              })}
            </div>
            <div className="card" style={{ padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#e05c5c", marginBottom: 14 }}>Penalty Strokes — Trend</div>
              <BarChart data={penaltyTrend} color="#e05c5c" format={function(v) { return String(v); }} />
            </div>
            {holesWithPenalty.length > 0 && (
              <div className="card" style={{ padding: "16px 18px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 14 }}>Penalties by Hole Type</div>
                {penaltyOnParTypes.map(function(item) { return (
                  <div key={item.par} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                    <span style={{ fontSize: 13, color: "rgba(245,240,232,.7)" }}>Par {item.par} holes</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: item.count > 0 ? "#e05c5c" : "rgba(245,240,232,.3)" }}>{item.count} hole{item.count !== 1 ? "s" : ""}</span>
                  </div>
                ); })}
              </div>
            )}
          </div>
        )}

        {tab === "putting" && (
          <div className="fade-up">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <StatCard label="Avg Putts/Round" value={avgPutts != null ? avgPutts : "—"} color="#c8763a" />
              <StatCard label="Avg Putts/Hole" value={(function() {
                const all = filteredRounds.flatMap(function(r) { return r.holes.filter(function(h) { return h.putts !== ""; }).map(function(h) { return Number(h.putts); }); });
                return all.length ? (all.reduce(function(a, b) { return a + b; }, 0) / all.length).toFixed(1) : "—";
              })()} color="#c8763a" />
            </div>
            <div className="card" style={{ padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#c8763a", marginBottom: 14 }}>Putts Per Round Trend</div>
              <BarChart data={puttsTrend} color="#c8763a" format={function(v) { return String(v); }} />
            </div>
            <div className="card" style={{ padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 14 }}>Putts When GIR vs. Non-GIR</div>
              {["GIR", "Non-GIR"].map(function(type) {
                const holes = filteredRounds.flatMap(function(r) { return r.holes.filter(function(h) { return h.putts !== "" && (type === "GIR" ? h.gir : !h.gir); }); });
                const a = holes.length ? holes.reduce(function(s, h) { return s + Number(h.putts); }, 0) / holes.length : null;
                return (
                  <div key={type} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                    <span style={{ fontSize: 13, color: "rgba(245,240,232,.7)" }}>{type} ({holes.length} holes)</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--cream)" }}>{a != null ? a.toFixed(1) + " putts avg" : "—"}</span>
                  </div>
                );
              })}
            </div>
            <div className="card" style={{ padding: "16px 18px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 14 }}>Putt Distribution</div>
              {[1, 2, 3, 4].map(function(n) {
                const all = filteredRounds.flatMap(function(r) { return r.holes.filter(function(h) { return h.putts !== ""; }); });
                const count = all.filter(function(h) { return Number(h.putts) === n; }).length;
                const pct = all.length ? Math.round(count / all.length * 100) : 0;
                return <StatBar key={n} label={(n === 4 ? "4+ putts" : n + " putt" + (n !== 1 ? "s" : "")) + " (" + count + ")"} value={pct} max={100} color={n === 1 ? "#4caf78" : n === 2 ? "var(--cream)" : n === 3 ? "#e09a4a" : "#e05c5c"} format={function(v) { return v + "%"; }} />;
              })}
            </div>
          </div>
        )}
        )}

        {/* ── RANGE ── */}
        {tab === "range" && (
          <div className="fade-up">
            {rangeSessions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 0" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🎯</div>
                <p style={{ color: "rgba(245,240,232,.5)", marginBottom: 16 }}>No practice sessions logged yet.</p>
                <p style={{ fontSize: 13, color: "rgba(245,240,232,.35)", lineHeight: 1.6 }}>
                  Log a session in Log Practice Session to track launch monitor data over time.
                </p>
              </div>
            ) : (() => {
              // Build per-club trend data across sessions (oldest first)
              const allSessions = [...rangeSessions].reverse();
              const sessions = limit === "all" ? allSessions : allSessions.slice(-Number(limit));
              const allClubIds = [...new Set(sessions.flatMap(s => Object.keys(s.shots || {})))];
              const clubsWithCarry = allClubIds.filter(id =>
                sessions.some(s => s.shots?.[id]?.carry)
              );

              // Key metrics trend for driver
              const driverData = sessions.map((s, i) => ({
                label: `S${i+1}`,
                carry: Number(s.shots?.driver?.carry) || null,
                ballSpeed: Number(s.shots?.driver?.ballSpeed) || null,
                smash: Number(s.shots?.driver?.smashFactor) || null,
              })).filter(d => d.carry);

              // Most recent session summary
              const latest = rangeSessions[0];
              const latestClubs = Object.entries(latest.shots || {})
                .filter(([, d]) => d.carry)
                .sort((a, b) => Number(b[1].carry) - Number(a[1].carry));

              return (
                <>
                  {/* Latest session snapshot */}
                  <div className="card" style={{ padding: "16px 18px", marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 4 }}>
                      Latest Session — {formatDate(latest.date)}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(245,240,232,.35)", marginBottom: 14 }}>
                      {latest.source}{latest.location ? ` · ${latest.location}` : ""}
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <div style={{ display: "flex", gap: 8, minWidth: "max-content" }}>
                        {latestClubs.map(([clubId, data]) => {
                          const club = CLUBS.find(c => c.id === clubId);
                          return (
                            <div key={clubId} style={{ background: "rgba(0,0,0,.2)", borderRadius: 8, padding: "10px 12px", textAlign: "center", minWidth: 62 }}>
                              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--gold)" }}>{data.carry}</div>
                              {data.total && data.total !== data.carry && (
                                <div style={{ fontSize: 11, color: "#4caf78" }}>{data.total}</div>
                              )}
                              <div style={{ fontSize: 9, color: "rgba(245,240,232,.35)", textTransform: "uppercase", marginTop: 3 }}>{club?.label}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Driver trend */}
                  {driverData.length > 1 && (
                    <div className="card" style={{ padding: "16px 18px", marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 14 }}>Driver Carry — Session Trend</div>
                      <BarChart
                        data={driverData.map(d => ({ label: d.label, value: d.carry }))}
                        color="var(--gold)"
                        format={v => `${v}y`}
                      />
                    </div>
                  )}

                  {/* Club-by-club comparison across sessions */}
                  {clubsWithCarry.length > 0 && (
                    <div className="card" style={{ padding: "16px 18px", marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 14 }}>
                        Carry Distance — First vs Latest Session
                      </div>
                      {clubsWithCarry.map(clubId => {
                        const club = CLUBS.find(c => c.id === clubId);
                        const firstVal = sessions.find(s => s.shots?.[clubId]?.carry)?.shots[clubId].carry;
                        const latestVal = [...sessions].reverse().find(s => s.shots?.[clubId]?.carry)?.shots[clubId].carry;
                        const diff = latestVal && firstVal ? Number(latestVal) - Number(firstVal) : null;
                        return (
                          <div key={clubId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                            <span style={{ fontSize: 13, color: "rgba(245,240,232,.7)", minWidth: 70 }}>{club?.label}</span>
                            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                              <span style={{ fontSize: 12, color: "rgba(245,240,232,.4)" }}>{firstVal}y → {latestVal}y</span>
                              {diff !== null && diff !== 0 && (
                                <span style={{ fontSize: 13, fontWeight: 700, color: diff > 0 ? "#4caf78" : "#e05c5c" }}>
                                  {diff > 0 ? "+" : ""}{diff}y
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Smash factor / ball speed if available */}
                  {driverData.some(d => d.ballSpeed) && (
                    <div className="card" style={{ padding: "16px 18px", marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#4a90d9", marginBottom: 14 }}>Driver Ball Speed (mph)</div>
                      <BarChart
                        data={driverData.filter(d => d.ballSpeed).map(d => ({ label: d.label, value: d.ballSpeed }))}
                        color="#4a90d9"
                        format={v => `${v}`}
                      />
                    </div>
                  )}

                  {/* All sessions log */}
                  <div className="card" style={{ padding: "16px 18px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 12 }}>Session Log</div>
                    {rangeSessions.map((s, i) => {
                      const clubCount = Object.values(s.shots || {}).filter(d => d.carry).length;
                      return (
                        <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < rangeSessions.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{s.location || "Log Practice Session"}</div>
                            <div style={{ fontSize: 11, color: "rgba(245,240,232,.4)" }}>{formatDate(s.date)} · {s.source}</div>
                          </div>
                          <span style={{ fontSize: 12, color: "rgba(245,240,232,.4)" }}>{clubCount} club{clubCount !== 1 ? "s" : ""}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        )}

      </div>
      )}
    </div>
  );
}
const DRILL_LIBRARY = [
  // ── FULL SWING ──
  { id: "d-grip",        cat: "Full Swing",   problem: [],                    title: "Finger Pressure Drill",       icon: "🤝", diff: "Beginner",
    what: "Hold the club in your fingers with just enough pressure that it doesn't drop. Make 20 half-swings maintaining that exact pressure throughout. If you feel tension creeping in, reset.",
    fixes: "Inconsistent contact, loss of feel, tension in the arms.",
    angle: "Face-on", angleNote: "Face-on shows grip position and arm tension." },

  { id: "d-takeaway",    cat: "Full Swing",   problem: [],                    title: "One-Piece Takeaway Drill",    icon: "↗", diff: "Beginner",
    what: "Place a headcover just outside the ball. Take the club back keeping it, your hands, arms, and shoulders moving as one unit for the first 18 inches — knocking the headcover out of the way signals you've picked up the club early.",
    fixes: "Early wrist hinge, steep backswing, over-the-top.",
    angle: "Down the line", angleNote: "Down the line reveals club plane in the takeaway." },

  { id: "d-step",        cat: "Full Swing",   problem: [],                    title: "Step Drill (Transition)",     icon: "🔄", diff: "Intermediate",
    what: "Swing to the top, then step your lead foot toward the target to start the downswing. This forces the lower body to initiate the sequence. Hit 20 balls this way before returning to a normal stance.",
    fixes: "Over-the-top, casting, pulling shots.",
    angle: "Face-on", angleNote: "Face-on shows the step and lower body lead." },

  { id: "d-impact-bag",  cat: "Full Swing",   problem: [],                    title: "Impact Bag / Towel Drill",    icon: "💥", diff: "Intermediate",
    what: "Roll a towel or use an impact bag. Practice driving your hands forward through impact with shaft lean at the moment of contact. Focus on a flat or bowed lead wrist. 50 reps daily.",
    fixes: "Flipping, scooping, early release, lack of compression.",
    angle: "Face-on", angleNote: "Face-on clearly shows shaft lean and hand position at impact." },

  { id: "d-pause-top",   cat: "Full Swing",   problem: [],                    title: "Pause at the Top Drill",      icon: "⏸", diff: "Beginner",
    what: "Make a full backswing and pause for a deliberate 2-count before starting the downswing. This breaks the rushing habit and lets you feel the proper sequence begin from the ground up.",
    fixes: "Rushing, poor transition, loss of sequence.",
    angle: "Down the line", angleNote: "Down the line shows the pause position and club plane." },

  { id: "d-9to3",        cat: "Full Swing",   problem: [],                    title: "9-to-3 Drill",                icon: "🕘", diff: "Beginner",
    what: "Hit shots where the backswing stops at 9 o'clock (lead arm parallel to ground) and the follow-through stops at 3 o'clock. Groove contact and timing before adding length. Hit 30 balls.",
    fixes: "Inconsistent contact, overswinging, poor strike.",
    angle: "Face-on", angleNote: "Face-on shows arm positions at both checkpoints." },

  // ── PROBLEM FIXES ──
  { id: "d-slice",       cat: "Problem Fix",  problem: ["slice","fade"],      title: "Anti-Slice: In-to-Out Drill", icon: "🎯", diff: "Intermediate",
    what: "Place a headcover just outside the ball and slightly ahead. Practice swinging to the right of the headcover through impact, promoting an in-to-out path. Use alignment sticks on the ground to confirm path. 30 balls per session.",
    fixes: "Slices, pulls, over-the-top swing path.",
    angle: "Down the line", angleNote: "Down the line shows swing path in vs out." },

  { id: "d-hook",        cat: "Problem Fix",  problem: ["hook","draw"],       title: "Anti-Hook: Path & Face Drill",icon: "↩", diff: "Intermediate",
    what: "Check grip first — a hook almost always starts with a too-strong grip. Weaken the grip (rotate both hands toward the target), then practice half-swings focusing on holding the face open through impact. Feel the lead wrist going from flat to slightly cupped at finish.",
    fixes: "Hooks, snap hooks, pulls.",
    angle: "Face-on", angleNote: "Face-on shows grip position and lead wrist through impact." },

  { id: "d-fat",         cat: "Problem Fix",  problem: ["fat","heavy","chunk"], title: "Anti-Fat: Ball-First Contact", icon: "🌱", diff: "Beginner",
    what: "Put a tee in the ground 2 inches behind the ball. Hit shots without touching the tee. This forces your low point forward. Also try: place more weight on your lead foot (60%) and keep it there throughout.",
    fixes: "Fat shots, heavy contact, chunks.",
    angle: "Face-on", angleNote: "Face-on shows weight distribution and low point." },

  { id: "d-thin",        cat: "Problem Fix",  problem: ["thin","skull","blade"], title: "Anti-Thin: Stable Head Drill", icon: "🎯", diff: "Beginner",
    what: "Put a coin on the ground where the ball would be. Focus on your eyes staying fixed on the coin through impact and beyond — don't look up. Thin shots almost always result from early extension or looking up early.",
    fixes: "Thin shots, bladed shots, topping.",
    angle: "Face-on", angleNote: "Face-on shows head movement and spine angle through impact." },

  { id: "d-shank",       cat: "Problem Fix",  problem: ["shank"],             title: "Anti-Shank Drill",            icon: "😱", diff: "Intermediate",
    what: "Shanks are caused by the hosel reaching the ball. Place a tee or coin just outside the ball (toward the hosel). Hit shots without touching the tee — this forces contact on the center of the face. Start with small swings. The shank is a proximity problem — you're standing too close or looping the club out.",
    fixes: "Shanks (hosel contact).",
    angle: "Face-on", angleNote: "Face-on shows your proximity to the ball and swing path." },

  { id: "d-early-ext",   cat: "Problem Fix",  problem: ["early extension","standing up"], title: "Anti-Early Extension Drill", icon: "🧱", diff: "Intermediate",
    what: "Stand with your backside touching a wall at address. Make practice swings while maintaining contact with the wall through impact. If you stand up early, you'll move away from the wall. 20 swings per session.",
    fixes: "Early extension, standing up through impact, thin shots, blocks.",
    angle: "Face-on", angleNote: "Face-on clearly shows if you're maintaining your posture angle." },

  { id: "d-casting",     cat: "Problem Fix",  problem: ["casting","over the top","slice"], title: "Lag Retention Drill",    icon: "🪁", diff: "Advanced",
    what: "On the downswing, feel like your trail elbow stays tucked to your side as long as possible before releasing. Practice slow-motion swings focusing on the feeling of the club 'trailing' behind your hands into the impact zone. Use an alignment stick along your spine to check the downswing shallows.",
    fixes: "Casting, over-the-top, loss of lag, slices.",
    angle: "Down the line", angleNote: "Down the line shows lag angle and elbow position in the downswing." },

  // ── SHORT GAME ──
  { id: "d-gate-chip",   cat: "Short Game",   problem: [],                    title: "Gate Drill (Chipping)",       icon: "📐", diff: "Beginner",
    what: "Place two tees just wider than the clubhead, one on each side of the ball. Chip shots without touching either tee. This trains a square face, consistent path, and prevents scooping.",
    fixes: "Chunked chips, thin chips, inconsistent contact.",
    angle: "Face-on", angleNote: "Face-on shows shaft lean and face position through the chip." },

  { id: "d-clock",       cat: "Short Game",   problem: [],                    title: "Clock Drill (Distance Control)", icon: "🕐", diff: "Beginner",
    what: "Imagine a clock face around the hole. Chip 10 balls to 3 o'clock (right of hole), 10 to 6 o'clock (behind), 10 to 9 o'clock, 10 to 12 o'clock. Control distance by swing length, not effort. Track how many land within 3 feet.",
    fixes: "Poor chipping distance control.",
    angle: "Face-on", angleNote: "Face-on shows swing length at different clock positions." },

  { id: "d-flop-hc",     cat: "Short Game",   problem: [],                    title: "Flop Shot Headcover Drill",   icon: "🚀", diff: "Advanced",
    what: "Place a headcover 2 feet in front of the ball. Practice flop shots that carry over the headcover and land softly. Open the face first, then re-grip. Commit to an aggressive swing — hesitation causes chunked flops.",
    fixes: "Fat flop shots, fear of the flop shot.",
    angle: "Face-on", angleNote: "Face-on shows face openness and commitment through impact." },

  { id: "d-sand-line",   cat: "Short Game",   problem: [],                    title: "Sand Entry Line Drill",       icon: "🏖", diff: "Intermediate",
    what: "Draw a line in the sand 2 inches behind where the ball would be. Practice entering the sand on that exact line, splashing sand onto the green. No ball needed at first. Consistency of entry point is the whole game in bunkers.",
    fixes: "Inconsistent bunker play, blading out of sand, leaving it in the bunker.",
    angle: "Face-on", angleNote: "Face-on shows your entry point relative to the ball position." },

  { id: "d-updown",      cat: "Short Game",   problem: [],                    title: "Up and Down Challenge",       icon: "⬆", diff: "Intermediate",
    what: "Drop 10 balls in various spots around the green (rough, fringe, different distances). Try to get up and down from each one — chip or pitch to 3 feet, make the putt. Track your success rate and note which situations give you the most trouble.",
    fixes: "Inconsistent scrambling, poor short game under pressure.",
    angle: "Face-on", angleNote: "Face-on for chip assessment; confirm specific issues with down the line." },

  // ── PUTTING ──
  { id: "d-gate-putt",   cat: "Putting",      problem: [],                    title: "Gate Drill (Putting)",        icon: "🎱", diff: "Beginner",
    what: "Place two tees just wider than the putter head, a few inches in front of the ball. Stroke 20 putts without the putter touching either tee. This trains a square face and consistent path through impact.",
    fixes: "Pulled putts, pushed putts, inconsistent face at impact.",
    angle: "Face-on", angleNote: "Face-on shows putter path and face angle through the gate." },

  { id: "d-coin",        cat: "Putting",      problem: [],                    title: "Coin Drill (Consistency)",    icon: "🪙", diff: "Beginner",
    what: "Place a coin on the green. Putt 20 balls, trying to roll each ball over the coin. Demands precise face control and focus on a tiny target. Works best from 6–10 feet.",
    fixes: "Poor focus, inconsistent line, wandering eyes.",
    angle: "Face-on", angleNote: "Face-on shows your eye position and stroke path." },

  { id: "d-3ft-circle",  cat: "Putting",      problem: [],                    title: "3-Foot Circle Drill",         icon: "⭕", diff: "Beginner",
    what: "Place 8 balls in a circle around the hole at 3 feet. Make all 8 consecutively. If you miss, start again. This builds confidence on short putts under pressure. Work up to a 4-foot and 5-foot circle.",
    fixes: "3-putt greens, anxiety on short putts, poor short putting.",
    angle: "Face-on", angleNote: "Face-on shows your setup and stroke on short putts." },

  { id: "d-distance",    cat: "Putting",      problem: [],                    title: "Ladder Drill (Distance Control)", icon: "📏", diff: "Intermediate",
    what: "Place tees at 10, 20, 30, and 40 feet from you. Putt one ball to each distance in order, trying to stop within 18 inches of each tee. Develops feel across all distances — the key to eliminating 3-putts.",
    fixes: "3-putting, poor lag putting, misjudging long putts.",
    angle: "Face-on", angleNote: "Face-on shows your stroke length calibration for different distances." },

  // ── DRIVER ──
  { id: "d-tee-sweep",   cat: "Driver",       problem: [],                    title: "Tee Height Sweep Drill",      icon: "🏌", diff: "Beginner",
    what: "Tee the ball high — half the ball above the top of the clubface. Make 15 slow driver swings focusing on sweeping up through the ball. Feel your weight staying back slightly and your trail shoulder staying low. Stop and check tee height before every rep.",
    fixes: "Low drives, driver pop-ups, hitting down on driver.",
    angle: "Down the line", angleNote: "Down the line shows the upward angle of attack through impact." },

  { id: "d-3qtr-balance",cat: "Driver",       problem: [],                    title: "3/4 Swing Balance Drill",     icon: "⚖", diff: "Beginner",
    what: "Hit driver at 75% effort and hold your finish for 3 full seconds after every shot. If you can't hold it, you swung too hard. Build tempo before adding speed. Distance comes from timing, not force.",
    fixes: "Wildness off the tee, loss of balance, poor tempo.",
    angle: "Face-on", angleNote: "Face-on shows your finish position and balance point." },

  // ── FULL SWING (additional) ────────────────────────────────────────────────
  { id: "d-alignment-stick", cat: "Full Swing", problem: [], title: "Alignment Stick Drill", icon: "📏", diff: "Beginner",
    what: "Place two alignment sticks on the ground — one along your toe line, one pointing at your target. Before every range shot, set up using the sticks. After 20 balls, remove them and recreate the same feeling. Use this drill to start every log practice session and your alignment will stop costing you shots.",
    fixes: "Poor alignment, aimed right or left, inconsistent setup.",
    angle: "Behind (down the line)", angleNote: "Down the line shows alignment relative to target clearly." },

  { id: "d-feet-together", cat: "Full Swing", problem: [], title: "Feet Together Drill", icon: "👣", diff: "Beginner",
    what: "Hit 7-iron shots with your feet touching together. This drill forces balance and reveals exactly how much you rely on lateral movement. Start with three-quarter swings. If you lose balance, your weight shift is too aggressive. Build up to full swings hitting 20 balls.",
    fixes: "Poor balance, swaying, over-the-top, general inconsistency.",
    angle: "Face-on", angleNote: "Face-on shows balance and whether weight stays centered." },

  { id: "d-right-arm-only", cat: "Full Swing", problem: [], title: "Trail Arm Only Drill", icon: "💪", diff: "Intermediate",
    what: "Hit soft 9-iron shots using only your trail arm (right for right-handers). Hold your lead arm behind your back. This exposes the feeling of the correct elbow tuck, shallow downswing, and extension through impact. Hit 15 balls one-handed then reattach the lead hand.",
    fixes: "Casting, chicken wing, poor extension, over-the-top.",
    angle: "Down the line", angleNote: "Down the line shows the shallow path this drill promotes." },

  { id: "d-lead-arm-only", cat: "Full Swing", problem: [], title: "Lead Arm Only Drill", icon: "🦾", diff: "Intermediate",
    what: "Hit punch shots using only your lead arm. Keep the grip firm, swing back to 9 o'clock, and drive through the ball. This builds lead arm strength, a flat lead wrist at impact, and teaches the arm to lead rather than the hands to flip. 15 reps before rejoining both hands.",
    fixes: "Flipping, scooping, weak lead side, loss of lag.",
    angle: "Face-on", angleNote: "Face-on shows lead wrist position and arm extension." },

  { id: "d-whoosh", cat: "Full Swing", problem: [], title: "Whoosh Drill (Speed Training)", icon: "💨", diff: "Beginner",
    what: "Flip your club upside down and hold the hosel. Make full swings as fast as possible trying to maximize the whoosh sound from the grip end. The louder the whoosh at impact, the faster your clubhead speed. Do 20 reps to train max speed, then hit 10 balls with the real club.",
    fixes: "Slow swing speed, deceleration through impact, poor sequencing.",
    angle: "Face-on", angleNote: "Face-on shows body rotation and arm extension creating speed." },

  { id: "d-pump-drill", cat: "Full Swing", problem: ["casting", "over the top"], title: "Pump Drill (Transition)", icon: "🔧", diff: "Intermediate",
    what: "Swing to the top, then pump the club down halfway two times before completing the swing. On the third pump, hit the ball. The pumping motion trains the correct transition — lower body leading, arms dropping, club shallowing. 20 reps before normal swings.",
    fixes: "Over-the-top, casting, poor transition, steep downswing.",
    angle: "Down the line", angleNote: "Down the line shows the shallowing move this drill creates." },

  { id: "d-split-grip", cat: "Full Swing", problem: [], title: "Split Grip Drill", icon: "✂", diff: "Intermediate",
    what: "Grip the club with 6 inches of separation between your hands (lead hand at top, trail hand near bottom of grip). Hit half-swing shots. The separation makes it impossible to flip — you'll feel the correct hinge and unhinge sequence immediately. Hit 20 shots then return to normal grip.",
    fixes: "Flipping, scooping, early release, inconsistent contact.",
    angle: "Face-on", angleNote: "Face-on shows hand action and shaft lean through impact." },

  { id: "d-towel-drill", cat: "Full Swing", problem: ["early extension", "standing up"], title: "Towel Under Arms Drill", icon: "🧻", diff: "Beginner",
    what: "Place a small towel or headcover under both armpits and hold it there throughout the swing without dropping it. This keeps the arms connected to the body and prevents the arms running away from the torso. Hit 20 balls maintaining the connection.",
    fixes: "Arms disconnecting from body, over-swinging, flying elbow.",
    angle: "Face-on", angleNote: "Face-on shows the arm-body connection throughout the swing." },

  // ── PROBLEM FIX (additional) ────────────────────────────────────────────────
  { id: "d-push", cat: "Problem Fix", problem: ["push", "block"], title: "Anti-Push / Block Drill", icon: "➡", diff: "Intermediate",
    what: "Place an alignment stick in the ground just outside the ball, angled away from you. If you push or block, the stick shows you the path is too in-to-out. Practice feeling the clubface staying square through impact. Hit 20 shots focusing on the face rotating to square at contact rather than staying open.",
    fixes: "Push shots, blocks, over-draw, snap hook from over-correction.",
    angle: "Down the line", angleNote: "Down the line shows path direction clearly at impact." },

  { id: "d-chicken-wing", cat: "Problem Fix", problem: ["chicken wing", "thin", "pull"], title: "Anti-Chicken Wing Drill", icon: "🐔", diff: "Intermediate",
    what: "After impact, practice holding your follow-through with the lead arm fully extended — elbow pointing down, not flaring out. Place a glove or headcover under your lead armpit and keep it there through impact. Losing it means the elbow broke down. 20 practice swings, then 20 balls.",
    fixes: "Chicken wing, thin shots, pulled shots, loss of power.",
    angle: "Face-on", angleNote: "Face-on clearly shows the lead arm extension after impact." },

  { id: "d-sway", cat: "Problem Fix", problem: ["sway", "fat", "thin"], title: "Anti-Sway: Brace Drill", icon: "🏋", diff: "Beginner",
    what: "Place a golf bag, chair, or wall against your trail hip at address. Make backswing turns without touching it — your hip should rotate, not slide into the bag. If you sway, you'll bump it. 30 slow practice turns, then 20 balls maintaining the same feel.",
    fixes: "Lateral sway on backswing, fat shots, reverse pivot.",
    angle: "Face-on", angleNote: "Face-on shows hip movement and whether the hip turns vs. slides." },

  { id: "d-reverse-pivot", cat: "Problem Fix", problem: ["reverse pivot", "thin", "slice"], title: "Anti-Reverse Pivot Drill", icon: "⚖", diff: "Beginner",
    what: "At the top of your backswing, you should feel 70% of your weight on your trail foot. Check this by trying to lift your lead foot slightly at the top — if you can, your weight is in the right place. If you fall toward the target, you're reverse pivoting. Practice 30 slow backswings checking this feeling.",
    fixes: "Reverse pivot, thin shots, loss of power, inconsistent contact.",
    angle: "Face-on", angleNote: "Face-on shows the spine tilt and weight position at the top." },

  { id: "d-topping", cat: "Problem Fix", problem: ["thin", "topping", "skull"], title: "Anti-Topping: Tee in Ground Drill", icon: "🔴", diff: "Beginner",
    what: "Push a tee into the ground (no ball) at your ball position. Practice hitting the tee — brushing the ground in front of it. This trains your low point to be in front of the ball. The tee breaks or stays in ground based on your contact. Hit 20 tees, then add a ball.",
    fixes: "Topping, thinning, sweeping iron shots, poor divots.",
    angle: "Face-on", angleNote: "Face-on shows low point and whether divot is before or after tee." },

  { id: "d-yips-swing", cat: "Problem Fix", problem: ["yips", "deceleration"], title: "Anti-Yips: Metronome Drill", icon: "🎵", diff: "Beginner",
    what: "Use a metronome app set to 60 BPM. Take the club back on beat 1, reach the top on beat 2, and arrive at impact on beat 3. The forced rhythm breaks the yip pattern by occupying the conscious mind with timing rather than outcome. Start with chip shots, then move to full swings.",
    fixes: "Swing yips, deceleration, jabbing at the ball, tension-driven mishits.",
    angle: "Face-on", angleNote: "Face-on shows rhythm and any tension in the swing." },

  // ── SHORT GAME (additional) ────────────────────────────────────────────────
  { id: "d-chip-landing", cat: "Short Game", problem: [], title: "Landing Zone Drill", icon: "🎯", diff: "Beginner",
    what: "Place a towel or tee 3 feet onto the green as your landing zone. Chip 10 balls from the same spot trying to land every shot on the towel. This shifts focus from the hole to the landing spot — the correct mental model for chipping. Vary the spot as you change distances.",
    fixes: "Poor chipping distance control, flying the green, leaving shots short.",
    angle: "Face-on", angleNote: "Face-on shows your trajectory and where the ball is landing." },

  { id: "d-bump-run", cat: "Short Game", problem: [], title: "Bump and Run Drill", icon: "🏃", diff: "Beginner",
    what: "Use a 7 or 8-iron for chips from just off the green. Play the ball back in your stance, weight forward, hands ahead. Land the ball on the fringe and let it run to the hole. Practice from 5, 10, and 15 yards. The bump-and-run is the most reliable short game shot — most amateurs never practice it.",
    fixes: "Over-reliance on lob shots, poor short game under pressure.",
    angle: "Face-on", angleNote: "Face-on shows the delofted shaft lean and ball position." },

  { id: "d-bunker-footwork", cat: "Short Game", problem: [], title: "Bunker Foot Twist Drill", icon: "👟", diff: "Beginner",
    what: "Before every bunker shot, twist both feet into the sand until secure. This lowers your body (sets up the right entry angle) and gives you a feel for sand depth. Practice the foot twist 10 times in a bunker before hitting any shots — the setup IS the bunker shot.",
    fixes: "Inconsistent bunker contact, skulling out, leaving it in the bunker.",
    angle: "Face-on", angleNote: "Face-on shows your height relative to the ball and sand level." },

  { id: "d-bunker-no-ball", cat: "Short Game", problem: [], title: "Bunker No-Ball Splash Drill", icon: "💦", diff: "Beginner",
    what: "Draw a circle in the sand about the size of a golf ball. Hit the center of the circle without a ball — just splash the sand out. The goal is consistent sand entry and a full follow-through. The sand should land on the green. 20 circles before adding a real ball.",
    fixes: "Inconsistent bunker entry, decelerating in sand, fear of bunkers.",
    angle: "Face-on", angleNote: "Face-on shows the entry point and follow-through completion." },

  { id: "d-chipping-yips", cat: "Short Game", problem: ["yips", "chipping yips"], title: "Chipping Yips: Long Grip Drill", icon: "🖐", diff: "Beginner",
    what: "Grip down to the bottom of the grip, or even hold the shaft itself. Chip with this shortened hold for 20 shots. The constraint breaks the motor pattern causing yips by forcing a different feel. Then gradually move the hands back up the grip over subsequent sessions.",
    fixes: "Chipping yips, jabbing, deceleration on chips.",
    angle: "Face-on", angleNote: "Face-on shows whether the stroke is accelerating through the ball." },

  { id: "d-pitch-distance", cat: "Short Game", problem: [], title: "Pitch Shot Clock Drill", icon: "⏱", diff: "Intermediate",
    what: "Using your pitching wedge, hit shots to three targets at 30, 50, and 70 yards. Each distance uses a different backswing length — 8 o'clock, 9 o'clock, and 10 o'clock. Hit 5 balls to each distance alternating randomly. Knowing your distances by backswing length is a tour-level skill.",
    fixes: "Poor wedge distance control, leaving approach shots short or long.",
    angle: "Face-on", angleNote: "Face-on shows backswing length at each clock position." },

  { id: "d-hinge-hold", cat: "Short Game", problem: [], title: "Hinge and Hold (Chip)", icon: "🔒", diff: "Intermediate",
    what: "For greenside chips, hinge your wrists slightly on the backswing, then hold that hinge angle through impact — don't release. This produces a descending blow with shaft lean, the tour standard for chipping. Practice in slow motion first: hinge back, hold through. 20 balls maintaining the angle.",
    fixes: "Scooping chips, flipping, inconsistent contact, fat chips.",
    angle: "Down the line", angleNote: "Down the line clearly shows shaft lean and wrist angle at impact." },

  // ── PUTTING (additional) ────────────────────────────────────────────────
  { id: "d-eyes-closed", cat: "Putting", problem: [], title: "Eyes Closed Putting Drill", icon: "😌", diff: "Beginner",
    what: "Set up a 6-foot putt, go through your routine, close your eyes, and stroke. This removes outcome anxiety and develops pure feel. Notice how different the stroke feels without visual feedback. Hit 10 putts eyes-closed, then 10 eyes-open. Many players discover their eyes-closed stroke is more fluid.",
    fixes: "Looking up early, anxiety over short putts, tension in stroke.",
    angle: "Face-on", angleNote: "Face-on shows whether the head moves before impact." },

  { id: "d-gate-long", cat: "Putting", problem: [], title: "Long Putt Gate Drill", icon: "🚪", diff: "Intermediate",
    what: "Place two tees just wider than the putter head at the midpoint of a 30-foot putt. The gate must be 15 feet from the ball. Stroke through the gate while also trying to stop the ball within 18 inches of the hole. This trains both path and distance simultaneously from lag distance.",
    fixes: "3-putting from distance, poor path on longer putts.",
    angle: "Behind (down the line)", angleNote: "Down the line shows putter path through the gate clearly." },

  { id: "d-hand-path", cat: "Putting", problem: [], title: "Chalk Line Drill", icon: "🖊", diff: "Beginner",
    what: "Use chalk or an alignment stick to create a perfectly straight line on the green. Set up with the putter face perpendicular to the line. Roll 20 balls along the line from 6 feet. The ball will immediately show if the face is open or closed and if your path is straight. The line gives instant visual feedback.",
    fixes: "Pulled or pushed putts, face angle issues, inconsistent starting line.",
    angle: "Face-on", angleNote: "Face-on shows the putter path relative to the chalk line." },

  { id: "d-nail-putt", cat: "Putting", problem: [], title: "Nail the Pace Drill", icon: "🎳", diff: "Intermediate",
    what: "Putt 10 balls from 20 feet trying to stop each one within a putter length (not in the hole — just close). Then 10 from 30 feet, 10 from 40 feet. Score yourself: 1 point for within a putter length, 2 for inside 6 inches. No penalty for going past. This builds aggressive, confident lag putting.",
    fixes: "Leaving putts short, dying pace, defensive lag putting.",
    angle: "Face-on", angleNote: "Face-on shows your stroke tempo and follow-through length." },

  { id: "d-arc-putt", cat: "Putting", problem: [], title: "Arc Awareness Drill", icon: "🌈", diff: "Intermediate",
    what: "Place a credit card behind the putter at address. Take the putter straight back until the card falls. This shows your natural arc — if the card falls early, you're manipulating straight. A naturally arcing stroke produces better face control. Practice 30 strokes noting where the card falls.",
    fixes: "Overcorrected straight-back-straight-through stroke causing pushes.",
    angle: "Face-on", angleNote: "Face-on shows the putter arc throughout the stroke." },

  { id: "d-pre-putt-routine", cat: "Putting", problem: [], title: "3-Step Routine Drill", icon: "1️⃣", diff: "Beginner",
    what: "Build a consistent 3-step putting routine and practice it on every single putt during a practice session: (1) Read from behind, (2) two practice strokes feeling the distance, (3) step in, one look at the hole, then stroke. Time yourself — aim for 25 seconds total. Consistency in process builds confidence under pressure.",
    fixes: "Inconsistent pre-putt routine, anxiety over putts, rushing.",
    angle: "Face-on", angleNote: "Face-on shows your setup consistency across the routine." },

  // ── DRIVER (additional) ────────────────────────────────────────────────
  { id: "d-driver-tee-low", cat: "Driver", problem: ["topping", "thin"], title: "Low Tee Driver Drill", icon: "⬇", diff: "Beginner",
    what: "Tee the driver very low (barely off the ground) and hit 10 shots. This forces a shallower angle of attack because you cannot hit down on a low-teed driver without topping it. Once you feel the shallow sweep, raise the tee to normal height and reproduce the same sensation.",
    fixes: "Steep angle of attack, pop-ups, hitting down on driver.",
    angle: "Down the line", angleNote: "Down the line shows the angle of attack into the ball." },

  { id: "d-driver-alignment", cat: "Driver", problem: [], title: "Driver Alignment Checkpoint", icon: "🗺", diff: "Beginner",
    what: "Before every driver on the range, place a club on the ground along your toe line and step back to check your aim from behind. Most golfers are aimed significantly right or left without realizing it. Check your alignment on 20 range drivers. Track whether you're consistently aimed correctly.",
    fixes: "Aimed right or left, compensatory swing paths, inconsistent tee shots.",
    angle: "Behind (down the line)", angleNote: "Behind shows alignment relative to your target line." },

  { id: "d-driver-curve", cat: "Driver", problem: [], title: "Intentional Curve Drill", icon: "🌀", diff: "Advanced",
    what: "Hit 5 intentional draws and 5 intentional fades on the range. For a draw: close the face slightly, swing along your foot line (slightly right). For a fade: open the face, swing left of your target. Being able to curve the ball on command is the mark of a skilled driver. This drill builds face and path awareness.",
    fixes: "Only one shot shape, no shot shaping ability, fear of curves.",
    angle: "Down the line", angleNote: "Down the line shows your swing path for each shape." },

  { id: "d-driver-tempo", cat: "Driver", problem: [], title: "Count to Three Driver Drill", icon: "3️⃣", diff: "Beginner",
    what: "Verbally count as you swing: say '1' as you start the takeaway, '2' at the top, '3' at impact. This forces a 3:1 backswing-to-downswing tempo ratio — the same ratio used by tour players. Rushing is almost always a '1-2' tempo. Hit 15 balls counting aloud.",
    fixes: "Rushing the downswing, poor tempo, loss of timing.",
    angle: "Face-on", angleNote: "Face-on shows the pause at the top and smooth transition." },

  // ── NEW CATEGORY: Course Management ────────────────────────────────────────
  { id: "d-landing-zone", cat: "Course Management", problem: [], title: "Landing Zone Planning Drill", icon: "🗾", diff: "Beginner",
    what: "On the range, pick a target and identify the SAFE ZONE — a 20-yard wide area where any shot in that zone leaves a good next shot. Hit 10 balls aiming for the safe zone, not the pin. You succeed if you hit the zone — not the center. This shifts your thinking from 'perfect shot' to 'good shot'. Take this onto the course.",
    fixes: "Overly aggressive targeting, not playing to your misses.",
    angle: "Down the line", angleNote: "Down the line confirms you are aligned to your intended zone." },

  { id: "d-180-rule", cat: "Course Management", problem: [], title: "180 Rule Drill", icon: "💯", diff: "Beginner",
    what: "For one entire log practice session, hit every shot with a gap wedge or 9-iron — nothing longer. This resets your instinct for what 'in control' feels like. On the course, apply the 180 rule: never attempt a shot you cannot control. If you can't reliably hit a 4-iron, don't use it. Choose the club you own.",
    fixes: "Ego-driven club selection, biting off more than you can chew, big numbers.",
    angle: "Face-on", angleNote: "Face-on confirms compact controlled swings under the 180 rule." },

  // ── NEW CATEGORY: Fitness & Mobility ───────────────────────────────────────
  { id: "d-hip-mobility", cat: "Fitness", problem: [], title: "Hip Rotation Drill (Off Course)", icon: "🧘", diff: "Beginner",
    what: "Stand with a club across your shoulders behind your neck. Rotate your hips left and right without moving your upper body. Do 20 reps each direction. This isolates hip rotation — the engine of the golf swing — and builds the mobility to separate lower and upper body. 5 minutes before every round.",
    fixes: "Restricted hip turn, poor separation, loss of distance with age.",
    angle: "Face-on", angleNote: "Face-on shows hip rotation independently of upper body." },

  { id: "d-thoracic", cat: "Fitness", problem: [], title: "Thoracic Spine Mobility Drill", icon: "🔃", diff: "Beginner",
    what: "Sit in a chair and cross your arms over your chest. Rotate your upper body left and right as far as comfortable, 20 reps each side. Then stand in your golf posture and repeat. Thoracic spine mobility directly improves shoulder turn and reduces lower back strain. Do this daily.",
    fixes: "Restricted backswing, poor shoulder turn, lower back pain during round.",
    angle: "Face-on", angleNote: "Face-on shows thoracic rotation range in golf posture." },

  // ── CHIPPING DISTANCE CONTROL ───────────────────────────────────────────────
  { id: "d-chip-5clubs", cat: "Short Game", problem: ["chipping yips", "distance control"], title: "5-Club Chipping Drill", icon: "🏒", diff: "Intermediate",
    what: "From the same spot just off the green, chip 5 balls each with a 9-iron, 8-iron, 7-iron, 6-iron, and 5-iron. Same swing every time — only the club changes. Watch how each club produces a different carry-to-roll ratio. This teaches you to use the whole bag around the green and eliminates the lob-shot-for-everything habit. Note each ball's landing spot and final position.",
    fixes: "Over-relying on lob wedge, poor chip distance control, one-trick short game.",
    angle: "Face-on", angleNote: "Face-on shows consistent technique as you change clubs." },

  { id: "d-chip-zones", cat: "Short Game", problem: ["distance control"], title: "Three Zone Chipping Drill", icon: "🎯", diff: "Beginner",
    what: "Place three targets at 10, 20, and 30 feet from you. Hit 5 chips to each zone in sequence, then mix them up randomly — someone calls out a zone and you chip to it immediately. The random element trains you to adjust in real time rather than groove one distance. Track your percentage inside 3 feet from each zone.",
    fixes: "Poor chipping distance control, struggling to adjust between distances.",
    angle: "Face-on", angleNote: "Face-on shows whether technique stays consistent across distances." },

  { id: "d-chip-eyes-closed", cat: "Short Game", problem: ["chipping yips", "yips"], title: "Eyes Closed Chip Drill", icon: "🙈", diff: "Beginner",
    what: "Set up a chip shot you'd normally yip. Close your eyes and chip. Without visual fixation on the outcome, the yip mechanism breaks down. Focus on the feel of the clubhead swinging. Hit 10 chips eyes-closed, then 10 eyes-open. The yip is a learned fear response — this drill interrupts the neural pattern.",
    fixes: "Chipping yips, deceleration, jabbing, tension-driven chips.",
    angle: "Face-on", angleNote: "Face-on shows whether the stroke accelerates through impact." },

  // ── 3-PUTTING / LAG PUTTING ─────────────────────────────────────────────────
  { id: "d-lag-3feet", cat: "Putting", problem: ["3-putting", "lag putting"], title: "Lag to a 3-Foot Circle", icon: "🎪", diff: "Intermediate",
    what: "Place 8 tees in a 3-foot radius circle around the hole. From 30, 40, and 50 feet, putt to stop inside the circle. Score yourself: 1 point for inside the circle, 0 for outside. Hit 10 from each distance. Tour average for 3-putts starts when lag putts finish outside 6 feet — your target is always inside 3. Keep a running total across sessions.",
    fixes: "3-putting, poor lag putting distance control, leaving long putts too far away.",
    angle: "Face-on", angleNote: "Face-on shows stroke length and tempo calibrated to distance." },

  { id: "d-putt-uphill-first", cat: "Putting", problem: ["3-putting"], title: "Uphill First Drill", icon: "⛰", diff: "Beginner",
    what: "When practicing lag putting, always start from the uphill side of the hole. Uphill putts are more forgiving and build confidence in aggressive pace. Once you can reliably lag uphill putts inside 3 feet, practice from the side and then downhill. Confidence in pace develops gradually — don't start with the hardest putt.",
    fixes: "Tentative lag putting, leaving putts short, fear of big putts.",
    angle: "Face-on", angleNote: "Face-on shows the stroke length needed for different slopes." },

  { id: "d-string-line", cat: "Putting", problem: ["3-putting", "starting line"], title: "String Line Drill", icon: "🧵", diff: "Beginner",
    what: "Tie a string between two tees across the hole on a straight 6-foot putt, just high enough to clear the putter head. Putt under the string — if the ball stays below the string, your line and face angle are correct. If the ball hits the string, your face was offline. 20 putts under the string builds a precise starting line.",
    fixes: "Poor putting starting line, pulled or pushed putts, misreading line.",
    angle: "Down the line", angleNote: "Down the line shows the ball rolling under the string correctly." },

  // ── BUNKER CONSISTENCY ──────────────────────────────────────────────────────
  { id: "d-bunker-dollar", cat: "Short Game", problem: [], title: "Dollar Bill Bunker Drill", icon: "💵", diff: "Beginner",
    what: "Place a dollar bill in the sand with the ball sitting on top of George Washington's face. Hit the near end of the dollar bill — your entry point — and the bill and ball will fly out together. This locks in the correct 2-inch entry point behind the ball. Practice without a ball first, then add the ball. 20 reps per session.",
    fixes: "Inconsistent bunker entry point, skulling bunker shots, leaving ball in sand.",
    angle: "Face-on", angleNote: "Face-on shows your entry point relative to the bill." },

  { id: "d-bunker-finish", cat: "Short Game", problem: [], title: "Bunker Follow-Through Drill", icon: "🏁", diff: "Beginner",
    what: "In a greenside bunker, practice hitting shots and holding your finish with the club pointing at the sky. If you decelerate, you cannot hold a high finish. The follow-through in a bunker should be as long as or longer than the backswing. Hit 15 shots holding the finish — if the ball doesn't come out, you decelerated.",
    fixes: "Decelerating in bunkers, leaving ball in sand, thin bunker shots.",
    angle: "Face-on", angleNote: "Face-on shows the full follow-through arc and finish height." },

  { id: "d-bunker-distance", cat: "Short Game", problem: [], title: "Bunker Distance Control Drill", icon: "📐", diff: "Intermediate",
    what: "Place targets at 10, 20, and 30 yards from a greenside bunker. Hit 5 bunker shots to each distance. Control distance by varying ONLY your backswing length — not swing speed. Longer swing, more distance. Keep the sand entry point and speed consistent. Most amateurs only know one bunker shot. This builds three.",
    fixes: "One-pace bunker game, leaving short bunker shots or flying over the green.",
    angle: "Face-on", angleNote: "Face-on shows backswing length variation for each distance." },

  // ── PUNCH SHOTS / KNOCKDOWNS ────────────────────────────────────────────────
  { id: "d-punch-setup", cat: "Full Swing", problem: [], title: "Punch Shot Drill", icon: "👊", diff: "Intermediate",
    what: "Play the ball two inches back in your stance, 60% weight on lead foot, hands well forward. Take a three-quarter backswing keeping the lead wrist flat. Drive through without releasing — hold the face square and finish with the hands low (no higher than the waist). The punch keeps the ball under wind and out of trouble. Hit 15 shots.",
    fixes: "Can't flight the ball low, struggles into the wind, no knockdown shot.",
    angle: "Down the line", angleNote: "Down the line shows the ball position and shaft lean clearly." },

  { id: "d-knockdown-gate", cat: "Full Swing", problem: [], title: "Knockdown Accuracy Drill", icon: "🎳", diff: "Advanced",
    what: "Place two alignment sticks 10 feet high forming a gate at your target line 50 yards away. Hit punch/knockdown shots under the gate. The gate forces a low trajectory — any release or full follow-through will send the ball over it. This drill teaches the 'hands ahead, face square, finish low' combination under competitive pressure.",
    fixes: "High ball flight in wind, inability to work ball under obstacles.",
    angle: "Down the line", angleNote: "Down the line shows trajectory and whether ball stays under gate height." },

  // ── DRAWS AND FADES ON DEMAND ───────────────────────────────────────────────
  { id: "d-draw-setup", cat: "Problem Fix", problem: ["draw", "slice"], title: "Draw on Demand Drill", icon: "↪", diff: "Intermediate",
    what: "Set up with the face closed 2-3 degrees to your target, then realign your feet, hips and shoulders slightly right of where the face points (for right-handers). Swing along your body line. The face-to-path relationship creates the draw. Hit 10 shots with this setup, gradually reducing the exaggeration until you can produce a subtle draw at will.",
    fixes: "Can only hit a fade or slice, no draw in the bag, limited shot shaping.",
    angle: "Down the line", angleNote: "Down the line shows the in-to-out path relative to the face." },

  { id: "d-fade-setup", cat: "Problem Fix", problem: ["fade", "hook"], title: "Fade on Demand Drill", icon: "↩", diff: "Intermediate",
    what: "Open the face 2-3 degrees to your target, then align body slightly left of where the face points. Swing along body line — the face points right of swing path, producing a fade. The key is NOT to cut across the ball but to swing straight along your body line. Hit 10 shots, then reduce the setup angle for a subtler fade.",
    fixes: "Can only hit a draw, no fade available, hook under pressure.",
    angle: "Down the line", angleNote: "Down the line shows the out-to-in path relative to the open face." },

  { id: "d-shape-alternating", cat: "Full Swing", problem: [], title: "Alternate Shot Shape Drill", icon: "↔", diff: "Advanced",
    what: "Hit one draw followed by one fade, alternating for 20 balls. You must commit to the shape before each shot — no changing your mind mid-setup. This drill forces genuine face and path awareness rather than accidental shot shaping. Keep track: how many did you actually curve as intended? Tour standard is 8 of 10.",
    fixes: "Inconsistent shot shaping, accidental curves, poor face/path awareness.",
    angle: "Down the line", angleNote: "Down the line shows path direction and confirms intended shape." },

  // ── TEMPO AND RHYTHM ───────────────────────────────────────────────────────
  { id: "d-21-beat", cat: "Full Swing", problem: [], title: "21-Beat Tempo Drill", icon: "🥁", diff: "Beginner",
    what: "Research by Dr. Scott Parel found tour professionals' swings take approximately 21 beats at a consistent tempo — roughly 3:1 backswing to downswing ratio. Count 1-2-3 on the backswing, 1 on the downswing. Practice this count on the range for an entire bucket. Ernie Els counted '1-2' on his backswing, '3' at impact. Find your count.",
    fixes: "Rushing, poor tempo, inconsistent timing, over-the-top from quick transition.",
    angle: "Face-on", angleNote: "Face-on shows the pause at the top and smooth transition rhythm." },

  { id: "d-slow-motion", cat: "Full Swing", problem: [], title: "Slow Motion Swing Drill", icon: "🐢", diff: "Beginner",
    what: "Make full swings at 20% of your normal speed. Go so slowly you can stop at any position and hold it. This builds body awareness, reveals positions you never feel at full speed, and trains correct movement patterns into muscle memory. Do 10 slow-motion swings for every 10 full-speed swings during practice. Professionals use this daily.",
    fixes: "Poor positions, body unawareness, rushing, inability to feel swing changes.",
    angle: "Down the line", angleNote: "Down the line reveals every position you'd miss at full speed." },

  { id: "d-breath-tempo", cat: "Full Swing", problem: [], title: "Breath Tempo Drill", icon: "💨", diff: "Beginner",
    what: "Take a slow, controlled breath in as you make your backswing. Exhale on the downswing. Your breathing naturally slows your tempo and prevents rushing. This is a live-on-the-course tool — not just a range drill. Practice it on 20 range shots, then use it during a round on any hole where you feel tempo slipping.",
    fixes: "Rushing, tension, poor tempo under pressure, over-trying.",
    angle: "Face-on", angleNote: "Face-on shows whether the slower breathing produces a more fluid swing." },

  { id: "d-grip-tempo", cat: "Full Swing", problem: [], title: "Grip Pressure Tempo Drill", icon: "🤲", diff: "Beginner",
    what: "Rate your grip pressure from 1-10 before each swing on a scale where 10 is maximum. Hit 5 balls at pressure 3, 5 balls at pressure 5, 5 balls at pressure 7. Notice what happens to your tempo and contact at each level. Most golfers discover 4-5 is their best tempo and ball-striking zone. Memorize that feeling.",
    fixes: "Tension, poor tempo, gripping too tight, loss of feel.",
    angle: "Face-on", angleNote: "Face-on shows how grip tension affects swing fluidity and rhythm." },

  // ── IMPACT AND COMPRESSION ─────────────────────────────────────────────────
  { id: "d-shaft-lean", cat: "Full Swing", problem: ["fat", "thin", "scooping"], title: "Shaft Lean Impact Drill", icon: "📐", diff: "Intermediate",
    what: "At address, push your hands forward until the shaft leans toward the target 5 degrees. This is your impact position — not your address position. Hit 20 balls holding that forward shaft lean through contact. Feel the ball compressing off a descending blow. Check: your lead wrist should be flat (not cupped) at impact.",
    fixes: "Scooping, flipping, fat shots, hitting up on irons, lack of compression.",
    angle: "Face-on", angleNote: "Face-on shows shaft lean — the number one indicator of impact quality." },

  { id: "d-divot-forward", cat: "Full Swing", problem: ["fat", "thin"], title: "Divot Direction Drill", icon: "🌿", diff: "Beginner",
    what: "After every iron shot on the range, check your divot. It should start AT the ball position or slightly in front — never behind. Place a tee at your ball position before each shot. If your divot starts behind the tee, your low point is early. Hit 20 shots until your divots consistently start on or in front of the tee.",
    fixes: "Fat shots, early low point, hitting behind the ball.",
    angle: "Face-on", angleNote: "Face-on shows your swing low point and divot pattern." },

  { id: "d-compressed-tee", cat: "Full Swing", problem: [], title: "Compression Tee Drill", icon: "🔩", diff: "Intermediate",
    what: "Tee a ball very low — barely off the ground, like a fairway lie. Hit iron shots off this low tee. A compressive, descending blow will make clean contact. Any scooping or early release will result in a fat or thin shot. This is the most honest compression test on the range. Hit 20 balls and note how many feel pure.",
    fixes: "Lack of compression, poor iron contact, topping, fat shots.",
    angle: "Down the line", angleNote: "Down the line shows the descending angle of attack into the tee." },

  { id: "d-board-drill", cat: "Full Swing", problem: ["fat", "early extension"], title: "Elevated Board Drill", icon: "🪵", diff: "Advanced",
    what: "Place a 2x4 board on the ground with a mat on top. Hit iron shots off the mat. The elevation forces your body to work correctly — you cannot hit fat because the board raises the surface. If you're scooping or early extending, you'll catch the board edge. Advanced version: hit shots where the ball sits on the edge.",
    fixes: "Fat shots, hitting behind the ball, poor impact position.",
    angle: "Face-on", angleNote: "Face-on shows the impact position relative to the raised surface." },

  // ── PRE-SHOT ROUTINE / MENTAL ──────────────────────────────────────────────
  { id: "d-box-routine", cat: "Mental", problem: [], title: "The Box Routine Drill", icon: "📦", diff: "Beginner",
    what: "Define your 'box' as the 3 feet around your ball. Everything outside the box is analysis (reading, club selection, distance). Inside the box is execution (routine, trigger, swing). Practice stepping into the box on every range shot as a distinct, deliberate action. When you step in, thinking stops and trust begins. Build this habit on the range before the course.",
    fixes: "Over-thinking on the course, can't switch from analytical to athletic mode.",
    angle: "Face-on", angleNote: "Face-on shows the transition from setup to committed swing." },

  { id: "d-target-walk", cat: "Mental", problem: [], title: "Target Walk-In Drill", icon: "🎯", diff: "Beginner",
    what: "For every shot on the range, stand 5 feet behind the ball, pick a specific intermediate target 3 feet ahead on your line (a blade of grass, a tee in the ground), walk into the shot keeping your eyes on the target. Align to the intermediate target, take one trigger breath, and swing. This is the exact routine used by most tour professionals. Practice it on every single range shot — not occasionally.",
    fixes: "Poor alignment, over-thinking at address, no consistent pre-shot routine.",
    angle: "Behind (down the line)", angleNote: "Down the line confirms you're aligned to the intermediate target." },

  { id: "d-reset-ritual", cat: "Mental", problem: [], title: "Post-Shot Reset Ritual", icon: "🔄", diff: "Beginner",
    what: "Design a personal reset ritual for bad shots and practice it deliberately: (1) Allow one second of emotion — a word, a breath, a grip release. (2) Take three deliberate steps away from the shot. (3) Say a reset phrase: 'next shot' or 'clean slate.' (4) Focus on something physical — the feel of the grip, the ground under your feet. Practice this on the range after intentionally hitting bad shots until the ritual becomes automatic.",
    fixes: "Carrying bad shots, anger on the course, losing focus after mistakes.",
    angle: "Face-on", angleNote: "Face-on shows the physical reset and mental refocus between shots." },

  { id: "d-one-thought", cat: "Mental", problem: [], title: "One Thought Drill", icon: "1️⃣", diff: "Beginner",
    what: "For an entire log practice session, allow yourself only ONE swing thought per shot. Write it on a card before you start: it could be 'turn', 'target', 'smooth', 'down and through' — anything. Stick to exactly that one thought regardless of results. Research shows performance degrades with more than one conscious thought during a swing. Practice limiting yourself. On the course: zero or one thought maximum.",
    fixes: "Over-thinking, paralysis by analysis, multiple simultaneous swing thoughts.",
    angle: "Face-on", angleNote: "Face-on shows whether one focused thought produces cleaner swings." },

  { id: "d-pressure-putt", cat: "Mental", problem: [], title: "Pressure Putt Drill", icon: "🔥", diff: "Intermediate",
    what: "Set up 10 putts in a circle at 4 feet. The rule: make all 10 consecutively or start over. Add stakes: if you don't finish within 5 attempts, you do 20 push-ups. The consequence creates real pressure similar to the course. Track your personal best (most made before a miss) and try to beat it each session. This is the closest thing to course pressure you can manufacture on the practice green.",
    fixes: "Choking on short putts, no pressure tolerance, falling apart in competition.",
    angle: "Face-on", angleNote: "Face-on shows your setup and stroke consistency under self-induced pressure." },

  { id: "d-visualization", cat: "Mental", problem: [], title: "Full Visualization Routine", icon: "🎬", diff: "Intermediate",
    what: "Before each range shot, spend 10 seconds with eyes closed: see the ball flight from start to finish, see it land exactly where you intend, hear the sound of pure contact. Then open your eyes, find your intermediate target, and swing. Initially this feels slow and artificial — that is expected. After 20+ sessions it becomes natural and directly translates to clearer commitment on the course.",
    fixes: "Uncommitted swings, steering shots, no clear intention before hitting.",
    angle: "Face-on", angleNote: "Face-on shows whether visualization produces more committed, fluid swings." },
];

const DRILL_CATS  = ["All", "Full Swing", "Problem Fix", "Short Game", "Putting", "Driver", "Course Management", "Mental", "Fitness"];
const DRILL_PROBS = ["All Problems", "slice", "hook", "fat", "thin", "shank", "casting", "early extension", "push", "sway", "yips", "chipping yips", "reverse pivot", "chicken wing", "topping", "draw", "fade", "distance control", "3-putting", "lag putting"];

function Drills({ goSwing }) {
  const [cat, setCat]       = useState("All");
  const [prob, setProb]     = useState("All Problems");
  const [search, setSearch] = useState("");
  const [open, setOpen]     = useState(null);

  const filtered = DRILL_LIBRARY.filter(d => {
    if (cat !== "All" && d.cat !== cat) return false;
    if (prob !== "All Problems" && !d.problem.includes(prob)) return false;
    if (search && !d.title.toLowerCase().includes(search.toLowerCase()) &&
        !d.fixes.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const DIFF_COLOR = { Beginner: "#4caf78", Intermediate: "#c8a84b", Advanced: "#e05c5c" };

  if (open) {
    const d = open;
    return (
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "30px 20px" }} className="fade-up">
        <button className="btn-outline" onClick={() => setOpen(null)} style={{ marginBottom: 22 }}>← Back</button>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 34 }}>{d.icon}</span>
          <div>
            <h2 style={{ color: "var(--gold)", fontSize: 22, lineHeight: 1.2 }}>{d.title}</h2>
            <div style={{ display: "flex", gap: 7, marginTop: 8, flexWrap: "wrap" }}>
              <span className="badge" style={{ background: "rgba(45,122,79,.3)", color: "var(--green-light)", border: "1px solid var(--green-bright)" }}>{d.cat}</span>
              <span className="badge" style={{ background: "rgba(200,168,75,.12)", color: DIFF_COLOR[d.diff], border: "1px solid var(--border)" }}>{d.diff}</span>
            </div>
          </div>
        </div>

        <div className="coach-bubble" style={{ marginBottom: 16 }}>
          <div style={{ color: "var(--gold-light)", fontWeight: 600, fontSize: 13, marginBottom: 8 }}>— The Drill</div>
          <p style={{ lineHeight: 1.75 }}>{d.what}</p>
        </div>

        <div style={{ background: "rgba(0,0,0,.2)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 6 }}>Fixes</div>
          <div style={{ fontSize: 13, color: "rgba(245,240,232,.65)", lineHeight: 1.6 }}>{d.fixes}</div>
        </div>

        <div style={{ background: "rgba(0,0,0,.2)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span>📷</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".3px" }}>
              Best Angle: {d.angle}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "rgba(245,240,232,.55)" }}>{d.angleNote}</div>
        </div>

        <button className="btn-gold" onClick={() => goSwing(`${d.title} — ${d.what.slice(0, 120)}`)}>
          📹 Analyze This Drill with Swing Analyzer
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "30px 20px" }}>
      <h2 className="fade-up" style={{ color: "var(--gold)", fontSize: 28, marginBottom: 6 }}>Drill Library</h2>
      <p className="fade-up" style={{ color: "rgba(245,240,232,.5)", marginBottom: 20, fontSize: 13 }}>
        {DRILL_LIBRARY.length} drills — by category, problem, or search
      </p>

      {/* Search */}
      <input
        className="field-input fade-up"
        placeholder="Search drills or problems (e.g. slice, fat, putting…)"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 14, fontSize: 13 }}
      />

      {/* Category filter */}
      <div className="fade-up" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {DRILL_CATS.map(c => (
          <button key={c} onClick={() => { setCat(c); setProb("All Problems"); }} style={{
            background: cat === c ? "var(--gold)" : "rgba(255,255,255,.06)",
            color: cat === c ? "var(--green-deep)" : "rgba(245,240,232,.65)",
            border: `1px solid ${cat === c ? "var(--gold)" : "var(--border)"}`,
            borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 600,
            cursor: "pointer", transition: "all .15s", fontFamily: "'DM Sans',sans-serif",
          }}>{c}</button>
        ))}
      </div>

      {/* Problem filter */}
      <div className="fade-up" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 22 }}>
        <span style={{ fontSize: 11, color: "rgba(245,240,232,.35)", alignSelf: "center", marginRight: 2 }}>Fix:</span>
        {DRILL_PROBS.map(p => (
          <button key={p} onClick={() => { setProb(p); setCat("All"); }} style={{
            background: prob === p ? "#e05c5c" : "rgba(255,255,255,.05)",
            color: prob === p ? "#fff" : "rgba(245,240,232,.55)",
            border: `1px solid ${prob === p ? "#e05c5c" : "var(--border)"}`,
            borderRadius: 20, padding: "4px 11px", fontSize: 11, fontWeight: 600,
            cursor: "pointer", transition: "all .15s", fontFamily: "'DM Sans',sans-serif",
            textTransform: "capitalize",
          }}>{p === "All Problems" ? "All" : p}</button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(245,240,232,.35)", fontSize: 14 }}>
          No drills found. Try a different filter or search.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((d, i) => (
          <div key={d.id} className="fade-up" style={{
            background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 10,
            padding: "15px 16px", cursor: "pointer", animationDelay: `${i * 0.03}s`,
            display: "flex", alignItems: "center", gap: 14, transition: "transform .15s, border-color .15s",
          }}
          onClick={() => setOpen(d)}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.borderColor = "var(--gold)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            <span style={{ fontSize: 26, flexShrink: 0 }}>{d.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{d.title}</div>
              <div style={{ fontSize: 11, color: "rgba(245,240,232,.4)", marginBottom: 4 }}>{d.cat}</div>
              <div style={{ fontSize: 11, color: "rgba(245,240,232,.5)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                Fixes: {d.fixes}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
              <span className="badge" style={{ color: DIFF_COLOR[d.diff], background: "rgba(200,168,75,.1)", border: "1px solid var(--border)", fontSize: 10 }}>{d.diff}</span>
              <span style={{ color: "var(--gold)", fontSize: 18 }}>›</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mental Game ───────────────────────────────────────────────────────────────
const MENTAL_CONTENT = [
  {
    id: "present",
    icon: "🎯",
    title: "The Only Shot That Exists",
    category: "Core Principle",
    tagline: "The past is gone. The future hasn't happened. This shot is all there is.",
    body: `The single most powerful shift you can make in golf is learning to play one shot at a time — truly, not as a phrase you repeat, but as an actual mental practice.

Most amateur golfers are playing three rounds simultaneously: the round they're on, the round they wish they were playing, and the round they're afraid they'll finish with. That mental noise is costing you shots on every hole.

The concept at the core of Zen Golf is that the present moment is the only place where a golf shot can be hit. Not your last double bogey. Not the score you need on the last three holes. Just this ball, this lie, this swing.

In practice this means: when you walk to your ball, you leave the last shot on the previous fairway. You don't carry it. The mental ritual is physical — pick a spot behind you where the bad shot stays, and literally walk away from it.

This is harder than it sounds and it requires practice just like any other golf skill. Start on the range. Hit a bad shot, pause, take a breath, and commit fully to the next one as if the bad one never happened. Over time it becomes a habit you carry to the course.`,
    exercise: "After your next bad shot on the course, stop before walking forward. Take one slow breath, then physically choose a spot behind you and say (silently or aloud): 'That shot stays here.' Walk to your ball with a clear mind.",
  },
  {
    id: "target",
    icon: "🔭",
    title: "See the Target, Not the Trouble",
    category: "Focus",
    tagline: "Your body goes where your eyes go. Aim your mind first.",
    body: `Here is a simple truth about the human nervous system: you move toward what you focus on. This is why tour professionals are obsessively target-focused, while most amateurs spend their mental energy rehearsing every way the shot could go wrong.

Standing over the water on a par 3, thinking "don't hit it in the water" is the worst possible use of your mind. Your brain doesn't process negatives well — it hears "water" and that becomes the target. The result is the most statistically common shot in amateur golf: the one that goes exactly where you were told not to hit it.

The fix is deliberate and simple: pick a specific target and commit your entire attention to it. Not the fairway in general — a specific tree, a spot of different-colored grass, a shadow. The more precise your target, the better your brain can direct the body to execute.

Dr. Bob Rotella calls this "target-minded" vs "swing-minded" golf. On the course, you are a target athlete. The swing was built on the range. Your only job now is to see the target, trust the swing, and get out of the way.`,
    exercise: "On every shot this round, identify your target before you step into your stance. Make it specific — not 'left center' but 'that sprinkler head.' After you've set up, take one final look at the target and let your eyes linger there for a beat before you pull the trigger.",
  },
  {
    id: "routine",
    icon: "🔄",
    title: "The Pre-Shot Routine as an Anchor",
    category: "Routine",
    tagline: "Consistency in process creates consistency in result.",
    body: `Every touring professional has a pre-shot routine. This is not superstition or habit for its own sake — it is a psychological technology. The routine serves three distinct functions that most golfers never think about.

First, it creates a consistent entry into the performance state. The same sequence of physical actions triggers the same mental state, the same level of focus, the same quality of commitment. It's pavlovian in the best possible way.

Second, it occupies the conscious, analytical mind. The conscious mind is largely unhelpful during a golf swing — it overrides the body's natural athletic ability with technical noise. A well-designed routine gives the conscious mind a job (alignment, target selection) and then empties it before the swing begins.

Third — and this is the insight from Zen Golf — the routine creates a bridge between thinking and trusting. The thinking part happens during the routine: reading the shot, selecting the club, choosing the target, taking practice swings. The moment you step into the address position, thinking ends and trust begins.

The routine doesn't need to be elaborate. It needs to be consistent. The same thing, every time, regardless of the situation. That consistency is the whole point — it is the psychological equivalent of taking the same warm-up route before a race.`,
    exercise: "Design your routine right now: (1) Read the shot from behind, (2) Pick an intermediate target 3 feet ahead on your line, (3) One practice swing with intent, (4) Set up and align, (5) One trigger — a breath, a forward press, a final look — then swing. Time yourself. Aim for 20–25 seconds total. Use it on every shot, every practice log practice session.",
  },
  {
    id: "self-image",
    icon: "🪞",
    title: "Your Golf Self-Image",
    category: "Mindset",
    tagline: "You play to the level of who you believe you are.",
    body: `One of the most overlooked mental game concepts is the power of self-image in determining golf performance. You consistently play to the level of the golfer you believe yourself to be — not higher, not lower.

This is why a golfer who shoots 90s occasionally puts together six great holes and then falls apart. The great holes are threatening their self-image as a 90s shooter, and the subconscious mind creates the collapse to restore balance. It sounds almost mystical but it's supported by decades of sports psychology research.

The implication is significant: sustainable score improvement requires changing your self-image first, not your swing. You need to genuinely start thinking of yourself as the golfer you want to become.

This doesn't mean delusional thinking or ignoring your actual level. It means stopping the self-deprecating narrative that most golfers run constantly — "I always miss this kind of putt," "I can never hold a lead," "My short game is terrible." Every one of those statements is an instruction to your nervous system.

Gio Valiante, who has worked with numerous major champions, describes this as "fearless golf" — playing from a self-image so stable and secure that outcomes don't threaten it. You hit a bad shot and it doesn't mean anything about who you are as a golfer. You step up to the next shot free.`,
    exercise: "For one full round, commit to zero negative self-talk. Every time you catch yourself saying something negative about your game (aloud or internally), immediately replace it with a neutral or forward-looking statement. Not 'I'm terrible at bunkers' but 'I'm working on my bunker play.' Notice what changes.",
  },
  {
    id: "acceptance",
    icon: "🌊",
    title: "Acceptance — The Par of the Mind",
    category: "Core Principle",
    tagline: "Fighting what happened is the second mistake. Accept the shot and move on.",
    body: `Zen Golf introduces a concept it calls the "PAR" of mental golf — Present, Acceptance, Release. Of the three, acceptance is the one most golfers resist.

Acceptance doesn't mean being satisfied with bad shots. It means acknowledging reality as it is and not wasting mental and emotional energy fighting it. The shot happened. It's in the rough. Fighting that reality — through anger, frustration, self-criticism, or replaying what went wrong — consumes the exact mental resources you need for the next shot.

Tour professionals get angry at bad shots too. The difference is speed of release. Watch Tiger Woods at his peak: a flash of frustration, then a visible reset, and by the time he reached his ball his face was neutral and focused. The emotion was acknowledged and released, not suppressed and carried.

The practical path to acceptance is the physical ritual. A deep breath — specifically a long exhale — activates the parasympathetic nervous system and physiologically returns you to a calm state. Walk deliberately to your ball. By the time you arrive, you should be neutral.

The hardest form of acceptance is accepting good shots too. Strange as it sounds, many golfers get nervous after a great stretch of holes — anxiety rises to fill the space where their familiar struggle usually lives. Accepting the good round as real, as deserved, as who you are, is part of this practice.`,
    exercise: "Develop a personal reset ritual for after bad shots. It should be: (1) one long exhale, (2) a physical action (regrip, look at the sky, take three steps), (3) a neutral internal statement ('next shot'). Practice this on the range after intentionally hitting poor shots until it becomes automatic.",
  },
  {
    id: "process",
    icon: "⚙",
    title: "Score vs. Process — What You Can Actually Control",
    category: "Mindset",
    tagline: "Focus on what you can control. Everything else is just information.",
    body: `One of the most freeing concepts in golf psychology is the distinction between outcome goals and process goals — and the recognition that you can only directly control one of them.

The score is an outcome. You can't control it directly. Conditions change, bounces happen, putts lip out. Becoming attached to a specific score creates anxiety that actively degrades your ability to produce the shots that would lead to that score.

What you can control: your pre-shot routine, your target selection, your commitment to the shot, your pace of play, your attitude between shots, and your response to adversity. These are all process elements.

Playing process-focused golf means your standard for each shot is not "did I make par" but "did I execute my routine, commit to my target, and give the shot a real chance?" A shot can be a full process success even if the outcome is poor — and those shots, compounded over 18 holes, produce the best outcomes you're capable of.

This is the framework behind Phil Mickelson's famous composure on the course. He's repeatedly described his goal as "giving every shot the best chance" — not making every shot, but preparing every shot properly. The distinction sounds subtle but it is transformative.`,
    exercise: "After your next round, rate yourself on process (1–10) separately from your score. Consider: How committed were you on each shot? How consistent was your routine? How quickly did you recover from bad shots? Track your process score alongside your actual score for 10 rounds and watch what happens.",
  },
  {
    id: "pressure",
    icon: "🔥",
    title: "Playing Under Pressure",
    category: "On-Course",
    tagline: "Pressure is a signal that something matters. Use it, don't fight it.",
    body: `Every golfer faces pressure moments — the short putt to break 90, the drive on the last hole with a score on the line, the first tee with the group watching. The difference between golfers who perform under pressure and those who don't is not the absence of nerves, but the relationship with them.

Adrenaline — the physical sensation of pressure — is not inherently harmful to golf performance. It sharpens focus, quickens reflexes, and increases energy. The problem is not the adrenaline itself but the interpretation of it. Golfers who choke interpret it as a threat signal. Golfers who rise to the occasion interpret the same sensation as readiness.

The research of Carol Dweck and others on reappraisal is directly applicable: when you feel nerves before an important shot, you can literally say to yourself "I'm excited" rather than "I'm nervous." The physiological state is identical — only the story changes — but the performance outcomes are measurably different.

Practically, pressure moments require tighter process discipline, not looser. When the stakes are higher, lean harder on your routine. Make it longer if needed — an extra practice swing, a longer look at the target. The routine is your anchor when the mind wants to sprint in ten directions.

Deep breathing specifically combats pressure physiology. A 4-count inhale and 8-count exhale activates the vagus nerve and brings the heart rate down within two breaths. Do this before high-stakes shots as a literal physiological intervention.`,
    exercise: "Create deliberate pressure in practice. On the range, set a consequence for the last 5 balls of each session (e.g., if you miss your target 3 times, you owe yourself 10 extra minutes of putting). Practice the breathing and routine under this micro-pressure. Build a tolerance to the sensation.",
  },
  {
    id: "bad-round",
    icon: "🌧",
    title: "When the Round Falls Apart",
    category: "On-Course",
    tagline: "Your response to a bad stretch is a skill. Train it.",
    body: `Every round reaches a moment of adversity. The question is never whether things will go wrong — they will — but what you'll do when they do. Your ability to respond constructively to a bad stretch is itself a trainable skill, and one that separates single-digit players from higher handicappers more than almost any technical factor.

The first principle is to never surrender the round mentally. A 7 on hole 6 does not have to affect hole 7. The score cannot be changed but the round is not over. Tour professionals with world-class mental games regularly card birdies immediately after double bogeys — not because they're different human beings but because they refuse to carry the bad hole forward.

The second principle, from Zen Golf, is to treat the bad stretch as information. What happened? Did you rush? Did you get too aggressive? Did you stop focusing on your target? There is almost always a specific mental or technical pattern behind a string of bad holes. Identifying it calmly (not critically) is genuinely useful.

The third principle is gratitude and perspective. This sounds soft but it works. You are outside, playing a game, in a body that can swing a golf club. The moment you zoom out from the score on the card, the pressure largely dissolves. Many of the greatest moments of levity in professional golf have come when players stopped taking themselves seriously.`,
    exercise: "The next time you make a double bogey or worse, walk to the next tee and ask yourself one question: 'What's one thing I can do differently right now?' One thing. Not a swing overhaul — just one adjustment. Commit to that adjustment and let the score go.",
  },
  {
    id: "course-mgmt",
    icon: "🗺",
    title: "Course Management as a Mental Skill",
    category: "On-Course",
    tagline: "The smartest shot and the easiest shot are usually the same shot.",
    body: `Course management is presented as a strategic topic but it is fundamentally a mental one. The instinct to take on unnecessary risk — to go for the green over water when a layup leaves an easy chip, to cut the corner of the dogleg when the safe route is only 20 yards longer — is driven by ego, not reason.

The mental game concept here is learning to separate your ego from your decision-making on the course. The aggressive shot is tempting because making it feels great and is memorable. The conservative shot is boring. But golf is scored on total strokes, and boring pars beat exciting bogeys every time.

Dr. Bob Rotella famously says "miss it in the right place." Before every approach, identify where the safe miss is — which side of the green leaves the easiest recovery, which rough is more manageable. Then aim for that miss zone when you're not confident. This is pro-level thinking available to any golfer at any handicap.

The mental practice is developing what the best players call "playing within yourself." Knowing your carry distances precisely. Knowing your dispersion patterns — where your misses go. And making decisions based on those realities rather than the best-case scenario of what might happen if you hit the shot perfectly.

Playing within yourself is also trust — trusting that making pars consistently is how scores come down, and that the spectacular shot is not required. Many amateur golfers' best-ever rounds happen when they're recovering from something and decide to just play conservatively. The lesson is usually clear but quickly forgotten.`,
    exercise: "On your next round, implement a '3-club rule': before every approach, identify which 3 clubs cover the range of outcomes (mis-hit, good hit, perfect hit). Always take the club for a good hit, never the club that requires a perfect hit. Track how this affects your greens hit and your scrambling.",
  },
  {
    id: "trust",
    icon: "✨",
    title: "Trust vs. Control — The Core Tension",
    category: "Core Principle",
    tagline: "The swing you built on the range is in there. Let it out.",
    body: `At the deepest level, the entire mental game of golf comes down to one tension: the choice between controlling and trusting. This is the central insight of Zen Golf, and it is also what every other sports psychology framework is circling.

The controlling mind tries to steer the ball, manage the body during the swing, supervise every position. It is activated by anxiety and doubt. It produces tension, deceleration, steering, and inconsistency.

The trusting mind commits to the shot, executes the routine, and releases to the swing. It is not passive — it is deeply focused on the target. But it does not intervene once the swing has started. It gets out of the way of the body's athletic intelligence.

The paradox of golf is that the more you try to control the result, the less control you have. The harder you try to steer the ball to the target, the less often it goes there. Trust — counterintuitive as it feels — produces better outcomes because it lets the body execute the motor pattern it has trained without interference.

This is why the range and the course feel so different. On the range there is nothing at stake and trust comes easily. On the course, the mind grabs control. The entire practice of the mental game is, at its heart, learning to recreate that range trust in competitive conditions.

The path to trust is process: a reliable routine, genuine pre-shot commitment, and a decision to let go once the swing starts. You cannot think your way to trust. You can only practice letting go, shot after shot, until it becomes your default.`,
    exercise: "Pick one round where your only goal is to 'commit and release.' For every shot, your standard is: did I fully commit to the shot in my routine, and did I release to the swing without steering? Score yourself on commitment, not on the result. Notice the relationship between high-commitment shots and ball flight.",
  },
];

const MENTAL_CATS = ["All", "Core Principle", "Mindset", "Routine", "Focus", "On-Course"];

function Mental() {
  const [cat, setCat]   = useState("All");
  const [open, setOpen] = useState(null);

  const filtered = cat === "All" ? MENTAL_CONTENT : MENTAL_CONTENT.filter(m => m.category === cat);

  const CAT_COLORS = {
    "Core Principle": "#c8a84b",
    "Mindset":        "#4a90d9",
    "Routine":        "#4caf78",
    "Focus":          "#9b7de8",
    "On-Course":      "#e07a30",
  };

  if (open) {
    const m = open;
    const color = CAT_COLORS[m.category] || "var(--gold)";
    return (
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "30px 20px" }} className="fade-up">
        <button className="btn-outline" onClick={() => setOpen(null)} style={{ marginBottom: 22 }}>← Back</button>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 38, lineHeight: 1 }}>{m.icon}</span>
          <div>
            <span className="badge" style={{ background: `${color}22`, color, border: `1px solid ${color}55`, marginBottom: 8, display: "inline-block" }}>
              {m.category}
            </span>
            <h2 style={{ color: "var(--gold)", fontSize: 22, lineHeight: 1.2 }}>{m.title}</h2>
          </div>
        </div>

        <div style={{
          fontStyle: "italic", fontSize: 15, color: "rgba(245,240,232,.65)",
          borderLeft: `3px solid ${color}`, paddingLeft: 14, marginBottom: 22, lineHeight: 1.6,
        }}>
          "{m.tagline}"
        </div>

        <div className="coach-bubble" style={{ marginBottom: 20 }}>
          {m.body.split("\n\n").map((para, i) => (
            <p key={i} style={{ marginBottom: i < m.body.split("\n\n").length - 1 ? 16 : 0, lineHeight: 1.75 }}>{para}</p>
          ))}
        </div>

        <div style={{
          background: `linear-gradient(135deg, ${color}18, ${color}08)`,
          border: `1px solid ${color}35`, borderRadius: 12, padding: "16px 18px", marginBottom: 16,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".4px" }}>
            🎯 Practice Exercise
          </div>
          <p style={{ fontSize: 14, color: "rgba(245,240,232,.75)", lineHeight: 1.7 }}>{m.exercise}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "30px 20px" }}>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 24 }}>
        <h2 style={{ color: "var(--gold)", fontSize: 28, marginBottom: 6 }}>Mental Game</h2>
        <p style={{ color: "rgba(245,240,232,.5)", fontSize: 13, lineHeight: 1.6 }}>
          The inner game of golf — concepts from Zen Golf, sports psychology, and the world's best coaches. Because technique only takes you so far.
        </p>
      </div>

      {/* Featured quote */}
      <div className="fade-up" style={{
        background: "linear-gradient(135deg, rgba(200,168,75,.14), rgba(200,168,75,.04))",
        border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px", marginBottom: 24,
      }}>
        <div style={{ fontSize: 26, marginBottom: 10 }}>🧘</div>
        <div style={{ fontSize: 16, fontStyle: "italic", color: "rgba(245,240,232,.8)", lineHeight: 1.7, marginBottom: 10 }}>
          "The most important shot in golf is the next one."
        </div>
        <div style={{ fontSize: 12, color: "rgba(245,240,232,.35)" }}>— Ben Hogan</div>
      </div>

      {/* Category filter */}
      <div className="fade-up" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
        {MENTAL_CATS.map(c => {
          const color = CAT_COLORS[c] || "var(--gold)";
          return (
            <button key={c} onClick={() => setCat(c)} style={{
              background: cat === c ? `${color}22` : "rgba(255,255,255,.05)",
              color: cat === c ? color : "rgba(245,240,232,.55)",
              border: `1px solid ${cat === c ? color + "55" : "var(--border)"}`,
              borderRadius: 20, padding: "5px 13px", fontSize: 11, fontWeight: 600,
              cursor: "pointer", transition: "all .15s", fontFamily: "'DM Sans',sans-serif",
            }}>{c}</button>
          );
        })}
      </div>

      {/* Concept cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((m, i) => {
          const color = CAT_COLORS[m.category] || "var(--gold)";
          return (
            <div key={m.id} className="fade-up" style={{
              background: "var(--card-bg)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "18px 18px", cursor: "pointer",
              animationDelay: `${i * 0.04}s`, transition: "transform .15s, border-color .15s",
            }}
            onClick={() => setOpen(m)}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = color; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <span style={{ fontSize: 30, flexShrink: 0, lineHeight: 1 }}>{m.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span className="badge" style={{ background: `${color}18`, color, border: `1px solid ${color}40`, fontSize: 10 }}>
                      {m.category}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--cream)", marginBottom: 6, lineHeight: 1.3 }}>{m.title}</div>
                  <div style={{ fontSize: 13, color: "rgba(245,240,232,.5)", fontStyle: "italic", lineHeight: 1.5 }}>
                    "{m.tagline}"
                  </div>
                </div>
                <span style={{ color: "var(--gold)", fontSize: 18, flexShrink: 0, marginTop: 4 }}>›</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div style={{ marginTop: 28, padding: "14px 16px", background: "rgba(0,0,0,.15)", borderRadius: 10, border: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ fontSize: 12, color: "rgba(245,240,232,.35)", lineHeight: 1.6 }}>
          📚 These concepts are drawn from <em>Zen Golf</em> by Dr. Joseph Parent, <em>Golf Is Not a Game of Perfect</em> by Dr. Bob Rotella, <em>Fearless Golf</em> by Dr. Gio Valiante, and <em>The Inner Game of Tennis</em> by W. Timothy Gallwey. We recommend reading all of them.
        </div>
      </div>
    </div>
  );
}

// ── My Goals ──────────────────────────────────────────────────────────────────
const GOAL_CATS = [
  { id: "scoring",   label: "Scoring",       icon: "🏆", color: "#c8a84b" },
  { id: "striking",  label: "Ball Striking",  icon: "🏌", color: "#4a90d9" },
  { id: "short",     label: "Short Game",     icon: "🎯", color: "#4caf78" },
  { id: "putting",   label: "Putting",        icon: "⛳", color: "#9b7de8" },
  { id: "mental",    label: "Mental",         icon: "🧠", color: "#e07a30" },
  { id: "routine",   label: "Routine",        icon: "🔄", color: "#4a90d9" },
];

const Q_STEPS = [
  { id: "handicap",     question: "What's your current handicap or typical score?", type: "single",
    options: ["Beginner (no handicap)", "Over 30", "21–30", "11–20", "6–10", "0–5", "Scratch or better"] },
  { id: "goal_score",   question: "What's your primary scoring goal?", type: "single",
    options: ["Break 120", "Break 100", "Break 90", "Break 80", "Break 70", "Improve handicap index", "Compete / win tournaments"] },
  { id: "timeline",     question: "What's your timeline to reach that goal?", type: "single",
    options: ["1 month", "3 months", "6 months", "1 year", "No rush — long game"] },
  { id: "play_freq",    question: "How often do you play or practice?", type: "single",
    options: ["Rarely (a few times a year)", "Monthly", "A few times a month", "Weekly", "Multiple times a week"] },
  { id: "practice_time",question: "How much practice time per week?", type: "single",
    options: ["Under 30 mins", "30–60 mins", "1–2 hours", "2–4 hours", "4+ hours"] },
  { id: "weaknesses",   question: "Where do you lose the most strokes?", type: "multi",
    options: ["Driving / off the tee", "Long irons / fairway woods", "Approach shots (100–150 yards)", "Short game (chipping & pitching)", "Bunkers", "Putting", "Course management", "Mental game / pressure"] },
  { id: "strengths",    question: "What part of your game feels strongest?", type: "multi",
    options: ["Driving distance", "Iron accuracy", "Short game touch", "Putting", "Course management", "Mental toughness", "Nothing feels strong right now"] },
  { id: "biggest_miss", question: "What's your most common ball-flight miss?", type: "single",
    options: ["Slice", "Hook", "Fat / heavy shots", "Thin / topped shots", "Push / block", "Pull / yank", "No consistent miss — all over the place"] },
  { id: "mental_focus", question: "How would you describe your mental game?", type: "single",
    options: ["Rock solid — I stay calm under pressure", "Pretty good but a few holes rattle me", "Inconsistent — some rounds great, some fall apart", "Struggle significantly with pressure and frustration", "Haven't really thought about the mental game"] },
  { id: "routine_focus",question: "Do you have a consistent pre-shot routine?", type: "single",
    options: ["Yes — I follow it every shot", "Sometimes — but it breaks down under pressure", "Not really — I just step up and hit", "No routine at all"] },
];

function ActionPlan({ coach, plan, setPlan, savedRounds, swingInsights, onGoalsComplete }) {
  const [step, setStep]           = useState(plan?.goals ? "goals" : "intro");
  const [answers, setAnswers]     = useState({});
  const [qIndex, setQIndex]       = useState(0);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [_generating, setGenerating] = useState(false);
  const [genError, setGenError]   = useState("");
  const [proposedGoals, setProposedGoals] = useState([]);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalCat, setNewGoalCat]   = useState("mental");
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [coachNote, setCoachNote]     = useState({ goalId: null, text: "", loading: false });
  const [showInsights, setShowInsights] = useState(false);

  const currentQ = Q_STEPS[qIndex];
  const isLastQ  = qIndex === Q_STEPS.length - 1;

  // Derive analytics-based suggestions from round data
  const analyticsInsights = (() => {
    if (savedRounds.length < 3) return [];
    const recent = savedRounds.slice(0, 8);
    const suggestions = [];
    const girAvg = recent.reduce((s,r) => s + (calcStats(r.holes).girPct||0), 0) / recent.length;
    const fwAvg  = recent.reduce((s,r) => s + (calcStats(r.holes).fwPct||0), 0)  / recent.length;
    const puttAvg= recent.reduce((s,r) => {
      const p = r.holes.filter(h=>h.putts!=="");
      return s + (p.length ? p.reduce((a,h)=>a+Number(h.putts),0)/p.length : 0);
    }, 0) / recent.length;
    const threeputts = recent.flatMap(r=>r.holes).filter(h=>Number(h.putts)>=3).length;
    if (girAvg < 30)  suggestions.push({ text: `Improve GIR% (currently ~${Math.round(girAvg)}%)`, cat: "striking", source: "analytics", insight: "You're missing the green in regulation frequently. More consistent approach play will lower your score faster than almost anything else." });
    if (fwAvg  < 45)  suggestions.push({ text: `Hit more fairways (currently ~${Math.round(fwAvg)}%)`, cat: "striking", source: "analytics", insight: "Driving accuracy is costing you scoring opportunities. More fairways means easier approach shots and fewer recovery situations." });
    if (puttAvg > 2.1)suggestions.push({ text: "Reduce putts per hole below 2.0", cat: "putting", source: "analytics", insight: "You're averaging over 2 putts per hole. Improving lag putting and short putt consistency is one of the quickest ways to drop shots." });
    if (threeputts > 4)suggestions.push({ text: `Eliminate 3-putts (${threeputts} in last ${recent.length} rounds)`, cat: "putting", source: "analytics", insight: "3-putts are score killers. Better lag putting distance control will have an immediate impact on your scores." });
    return suggestions;
  })();

  function toggleMulti(id, val) {
    setAnswers(a => { const cur = a[id]||[]; return { ...a, [id]: cur.includes(val) ? cur.filter(x=>x!==val) : [...cur,val] }; });
  }
  function selectSingle(id, val) { setAnswers(a => ({ ...a, [id]: val })); }
  function canAdvance() {
    const ans = answers[currentQ.id];
    return currentQ.type === "multi" ? ans && ans.length > 0 : !!ans;
  }
  function advance() {
    if (qIndex < Q_STEPS.length - 1) setQIndex(i => i+1);
    else generateGoals();
  }

  async function generateGoals() {
    setStep("generating");
    setGenerating(true);
    try {
      const roundsSummary = savedRounds.length > 0
        ? `${savedRounds.length} rounds tracked. Recent avg score ~${Math.round(savedRounds.slice(0,5).reduce((s,r)=>{ const st=calcStats(r.holes); return s+(st.total||0); },0)/Math.min(savedRounds.length,5))}.`
        : "No rounds tracked yet.";

      const system = `You are ${coach.name}, an expert golf coach. Based on the player's profile, propose exactly 7 specific, measurable golf goals. Return ONLY a JSON array, no other text:
[{"text":"goal description","cat":"scoring|striking|short|putting|mental|routine","why":"1-2 sentence coaching rationale"}]

Rules: Mix categories — include at least 1 mental/routine goal. Make goals specific and measurable. Order by impact on scoring.`;

      const prompt = `Player profile:
Handicap: ${answers.handicap}
Goal: ${answers.goal_score} in ${answers.timeline}
Frequency: ${answers.play_freq}, ${answers.practice_time}/week
Weaknesses: ${(answers.weaknesses||[]).join(", ")}
Strengths: ${(answers.strengths||[]).join(", ")}
Miss: ${answers.biggest_miss}
Mental: ${answers.mental_focus}
Routine: ${answers.routine_focus}
${additionalInfo ? "Additional: " + additionalInfo : ""}
${roundsSummary}`;

      const result = await askClaude({ system, messages: [{ role: "user", content: prompt }] });
      const clean = result.replace(/```json|```/g, "").trim();
      const goals = JSON.parse(clean);
      setProposedGoals(goals.map((g, i) => ({ ...g, id: `g_${Date.now()}_${i}` })));
      setStep("pick");
    } catch (e) {
      setGenError("Couldn't generate goals — check your connection and try again. You can add goals manually below.");
      setStep("pick");
      setProposedGoals([]);
    } finally {
      setGenerating(false);
    }
  }

  function confirmGoals() {
    const chosen = proposedGoals
      .filter(g => selectedGoals.includes(g.id))
      .map(g => ({ ...g, status: "active", createdAt: new Date().toLocaleDateString(), updates: [] }));
    const analyticsChosen = analyticsInsights
      .filter(g => selectedGoals.includes("ana_" + g.text))
      .map(g => ({ id: `ana_${Date.now()}_${Math.random()}`, text: g.text, cat: g.cat, why: g.insight, source: "analytics", status: "active", createdAt: new Date().toLocaleDateString(), updates: [] }));
    const existing = plan?.goals || [];
    setPlan(p => ({ ...(p||{}), answers, additionalInfo, goals: [...existing, ...chosen, ...analyticsChosen] }));
    setStep("goals");
    setTimeout(() => onGoalsComplete && onGoalsComplete(), 300);
  }

  function addManualGoal() {
    if (!newGoalText.trim()) return;
    const goal = { id: `manual_${Date.now()}`, text: newGoalText.trim(), cat: newGoalCat, why: "", source: "player", status: "active", createdAt: new Date().toLocaleDateString(), updates: [] };
    setPlan(p => ({ ...(p||{}), goals: [...(p?.goals||[]), goal] }));
    setNewGoalText(""); setShowAddGoal(false);
  }

  function updateGoalStatus(goalId, status) {
    setPlan(p => ({ ...p, goals: p.goals.map(g => g.id === goalId ? { ...g, status, completedAt: status==="completed" ? new Date().toLocaleDateString() : undefined } : g) }));
  }

  async function getCoachNote(goal) {
    setCoachNote({ goalId: goal.id, text: "", loading: true });
    try {
      const roundsCtx = savedRounds.length > 0
        ? `Player has ${savedRounds.length} rounds tracked.`
        : "No rounds tracked.";
      const system = `You are ${coach.name}, a golf coach. Give a concise 2-3 paragraph coaching response about this specific goal. Be practical, specific, and in your coaching voice.`;
      const prompt = `Goal: "${goal.text}" (${GOAL_CATS.find(c=>c.id===goal.cat)?.label || goal.cat})
Player context: ${roundsCtx}
Swing insights: ${swingInsights.slice(0,2).join(" | ") || "none yet"}
What specific advice, drills, or milestones should I focus on to achieve this goal?`;
      const result = await askClaude({ system, messages: [{ role: "user", content: prompt }] });
      setCoachNote({ goalId: goal.id, text: result, loading: false });
    } catch (e) {
      setCoachNote({ goalId: goal.id, text: "Coaching guidance requires a connection.", loading: false });
    }
  }

  // ── Intro ────────────────────────────────────────────────────────────────────
  if (step === "intro") return (
    <div style={{ maxWidth: 580, margin: "0 auto", padding: "40px 20px", textAlign: "center" }} className="fade-up">
      <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
      <h2 style={{ color: "var(--gold)", fontSize: 28, marginBottom: 10 }}>My Goals</h2>
      <p style={{ color: "rgba(245,240,232,.6)", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
        Answer a few questions and {coach.emoji} {coach.name} will propose specific, measurable goals for your game. You pick 3–5 to focus on. Your goals evolve as your game does.
      </p>
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", marginBottom: 28, textAlign: "left" }}>
        {["Coach-recommended goals based on your profile", "Analytics-driven suggestions from your rounds", "Mental & routine goals you define yourself", "Mark complete, pivot, or get coaching on any goal"].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < 3 ? 10 : 0 }}>
            <span style={{ color: "var(--gold)" }}>✓</span>
            <span style={{ fontSize: 13, color: "rgba(245,240,232,.7)" }}>{item}</span>
          </div>
        ))}
      </div>
      <button className="btn-gold" onClick={() => setStep("questionnaire")}>Build My Goals →</button>
      <div style={{ marginTop: 14 }}>
        <button className="btn-outline" onClick={() => { setPlan(p => ({ ...(p||{}), goals: [] })); setStep("goals"); setTimeout(() => onGoalsComplete && onGoalsComplete(), 300); }} style={{ fontSize: 12 }}>
          Skip — add goals manually
        </button>
      </div>
    </div>
  );

  // ── Questionnaire ────────────────────────────────────────────────────────────
  if (step === "questionnaire") return (
    <div style={{ maxWidth: 580, margin: "0 auto", padding: "30px 20px" }} className="fade-up">
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: "rgba(245,240,232,.4)" }}>Question {qIndex+1} of {Q_STEPS.length}</span>
          <span style={{ fontSize: 12, color: "var(--gold)" }}>{Math.round((qIndex/Q_STEPS.length)*100)}% complete</span>
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,.08)", borderRadius: 2 }}>
          <div style={{ height: "100%", width: `${(qIndex/Q_STEPS.length)*100}%`, background: "var(--gold)", borderRadius: 2, transition: "width .3s" }} />
        </div>
      </div>
      <div style={{ fontSize: 10, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8, fontWeight: 700 }}>{coach.emoji} {coach.name} wants to know</div>
      <h3 style={{ color: "var(--cream)", fontSize: 20, lineHeight: 1.4, marginBottom: 22 }}>{currentQ.question}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {currentQ.options.map(opt => {
          const isSel = currentQ.type === "multi" ? (answers[currentQ.id]||[]).includes(opt) : answers[currentQ.id] === opt;
          return (
            <button key={opt} onClick={() => currentQ.type === "multi" ? toggleMulti(currentQ.id, opt) : selectSingle(currentQ.id, opt)} style={{
              padding: "13px 16px", borderRadius: 10, border: "2px solid",
              borderColor: isSel ? "var(--gold)" : "var(--border)",
              background: isSel ? "rgba(200,168,75,.14)" : "var(--card-bg)",
              color: isSel ? "var(--gold)" : "rgba(245,240,232,.75)",
              textAlign: "left", cursor: "pointer", fontSize: 14, fontWeight: isSel ? 700 : 400,
              fontFamily: "'DM Sans',sans-serif", transition: "all .15s",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{ width: 18, height: 18, borderRadius: currentQ.type === "multi" ? 4 : "50%", flexShrink: 0, border: "2px solid", borderColor: isSel ? "var(--gold)" : "rgba(255,255,255,.2)", background: isSel ? "var(--gold)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--green-deep)" }}>{isSel && (currentQ.type==="multi" ? "✓" : "")}</div>
              {opt}
            </button>
          );
        })}
      </div>
      {isLastQ && (
        <div style={{ marginTop: 20 }}>
          <label className="field-label">Anything else to factor in? <span style={{ fontWeight: 400, color: "rgba(245,240,232,.3)" }}>(optional)</span></label>
          <textarea className="field-input" rows={3} placeholder="e.g. back injury limits rotation, play mostly links courses, had a lesson recently"
            value={additionalInfo} onChange={e => setAdditionalInfo(e.target.value)} />
        </div>
      )}
      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        {qIndex > 0 && <button className="btn-outline" onClick={() => setQIndex(i=>i-1)} style={{ flex: 1 }}>← Back</button>}
        <button className="btn-gold" onClick={advance} disabled={!canAdvance()} style={{ flex: 2 }}>
          {isLastQ ? "Generate My Goals →" : "Next →"}
        </button>
      </div>
      {genError && <div style={{ fontSize: 12, color: "#f87171", marginTop: 12, background: "rgba(224,92,92,.1)", border: "1px solid rgba(224,92,92,.25)", borderRadius: 8, padding: "10px 14px", lineHeight: 1.6 }}>{genError}</div>}
    </div>
  );

  // ── Generating ───────────────────────────────────────────────────────────────
  if (step === "generating") return (
    <div style={{ maxWidth: 580, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 44, marginBottom: 20 }}>{coach.emoji}</div>
      <div style={{ fontSize: 17, color: "var(--gold)", fontWeight: 700, marginBottom: 10 }}>{coach.name} is building your goals…</div>
      <p style={{ fontSize: 13, color: "rgba(245,240,232,.45)", lineHeight: 1.6 }}>Analysing your profile and game to propose specific, measurable goals.</p>
      <div className="spinner" style={{ margin: "28px auto 0" }} />
    </div>
  );

  // ── Pick Goals ───────────────────────────────────────────────────────────────
  if (step === "pick") {
    const allProposed = [
      ...proposedGoals,
      ...analyticsInsights.map(g => ({ ...g, id: "ana_" + g.text, source: "analytics" })),
    ];
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "30px 20px" }} className="fade-up">
        <h2 style={{ color: "var(--gold)", fontSize: 24, marginBottom: 6 }}>Choose Your Goals</h2>
        <p style={{ color: "rgba(245,240,232,.5)", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
          {coach.name} has proposed the goals below. Pick <strong style={{ color: "var(--gold)" }}>3–5</strong> to focus on. You can always add more later.
        </p>
        {allProposed.length === 0 && (
          <div style={{ fontSize: 13, color: "rgba(245,240,232,.4)", marginBottom: 20, fontStyle: "italic" }}>
            Could not generate goals automatically — add them manually below.
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {allProposed.map(g => {
            const cat   = GOAL_CATS.find(c => c.id === g.cat) || GOAL_CATS[0];
            const isSel = selectedGoals.includes(g.id);
            return (
              <button key={g.id} onClick={() => setSelectedGoals(prev => isSel ? prev.filter(x=>x!==g.id) : [...prev, g.id])} style={{
                padding: "14px 16px", borderRadius: 12, border: "2px solid",
                borderColor: isSel ? cat.color : "var(--border)",
                background: isSel ? `${cat.color}18` : "var(--card-bg)",
                textAlign: "left", cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                transition: "all .15s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${isSel ? cat.color : "rgba(255,255,255,.2)"}`, background: isSel ? cat.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--green-deep)", flexShrink: 0 }}>{isSel ? "✓" : ""}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: cat.color, textTransform: "uppercase", letterSpacing: ".4px" }}>{cat.icon} {cat.label}{g.source === "analytics" ? " · 📊 from your data" : ""}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--cream)", marginBottom: 4, paddingLeft: 28 }}>{g.text}</div>
                {g.why && <div style={{ fontSize: 12, color: "rgba(245,240,232,.5)", lineHeight: 1.5, paddingLeft: 28 }}>{g.why}</div>}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 12, color: selectedGoals.length >= 3 ? "var(--gold)" : "rgba(245,240,232,.35)", marginBottom: 16, textAlign: "center" }}>
          {selectedGoals.length} selected {selectedGoals.length < 3 ? `— pick at least ${3 - selectedGoals.length} more` : selectedGoals.length > 5 ? "— consider focusing on fewer goals" : "— good focus"}
        </div>
        <button className="btn-gold" onClick={confirmGoals} disabled={selectedGoals.length < 1}>
          Confirm My Goals →
        </button>
        <div style={{ marginTop: 10 }}>
          <button className="btn-outline" style={{ fontSize: 12 }} onClick={() => { setPlan(p => ({ ...(p||{}), goals: p?.goals||[] })); setStep("goals"); setTimeout(() => onGoalsComplete && onGoalsComplete(), 300); }}>
            Skip selection — I'll add manually
          </button>
        </div>
      </div>
    );
  }

  // ── Goals Dashboard ──────────────────────────────────────────────────────────
  const allGoals   = plan?.goals || [];
  const active     = allGoals.filter(g => g.status === "active");
  const completed  = allGoals.filter(g => g.status === "completed");
  const paused     = allGoals.filter(g => g.status === "paused");

  function GoalCard({ goal }) {
    const cat     = GOAL_CATS.find(c => c.id === goal.cat) || GOAL_CATS[0];
    const isNote  = coachNote.goalId === goal.id;
    const [showMenu, setShowMenu] = useState(false);
    return (
      <div style={{ background: "var(--card-bg)", border: `1px solid ${goal.status === "completed" ? "rgba(76,175,120,.3)" : "var(--border)"}`, borderRadius: 12, padding: "16px", marginBottom: 10, opacity: goal.status !== "active" ? 0.6 : 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          {/* Complete checkbox */}
          <button onClick={() => updateGoalStatus(goal.id, goal.status === "completed" ? "active" : "completed")} style={{
            width: 22, height: 22, borderRadius: "50%", border: `2px solid ${goal.status === "completed" ? "#4caf78" : "rgba(255,255,255,.25)"}`,
            background: goal.status === "completed" ? "#4caf78" : "transparent",
            cursor: "pointer", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--green-deep)",
          }}>{goal.status === "completed" ? "✓" : ""}</button>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: cat.color, textTransform: "uppercase", letterSpacing: ".4px" }}>{cat.icon} {cat.label}</span>
              {goal.source === "analytics" && <span style={{ fontSize: 9, color: "rgba(245,240,232,.3)" }}>· 📊 data</span>}
              {goal.source === "player" && <span style={{ fontSize: 9, color: "rgba(245,240,232,.3)" }}>· self-set</span>}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: goal.status === "completed" ? "rgba(245,240,232,.5)" : "var(--cream)", textDecoration: goal.status === "completed" ? "line-through" : "none", lineHeight: 1.4 }}>
              {goal.text}
            </div>
            {goal.completedAt && <div style={{ fontSize: 11, color: "#4caf78", marginTop: 3 }}>Completed {goal.completedAt} 🎉</div>}
          </div>
          {/* Actions menu */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowMenu(m => !m)} style={{ background: "none", border: "none", color: "rgba(245,240,232,.35)", cursor: "pointer", fontSize: 18, padding: "0 4px" }}>···</button>
            {showMenu && (
              <div style={{ position: "absolute", right: 0, top: 24, background: "var(--green-mid)", border: "1px solid var(--border)", borderRadius: 8, zIndex: 50, minWidth: 150, boxShadow: "0 4px 16px rgba(0,0,0,.4)" }}>
                {goal.status !== "completed" && <button onClick={() => { updateGoalStatus(goal.id, "completed"); setShowMenu(false); }} style={{ display: "block", width: "100%", padding: "10px 14px", background: "none", border: "none", color: "rgba(245,240,232,.8)", textAlign: "left", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>✓ Mark complete</button>}
                {goal.status === "active" && <button onClick={() => { updateGoalStatus(goal.id, "paused"); setShowMenu(false); }} style={{ display: "block", width: "100%", padding: "10px 14px", background: "none", border: "none", color: "rgba(245,240,232,.8)", textAlign: "left", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>⏸ Pivot / pause</button>}
                {goal.status === "paused" && <button onClick={() => { updateGoalStatus(goal.id, "active"); setShowMenu(false); }} style={{ display: "block", width: "100%", padding: "10px 14px", background: "none", border: "none", color: "rgba(245,240,232,.8)", textAlign: "left", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>▶ Reactivate</button>}
                <button onClick={() => { setPlan(p => ({ ...p, goals: p.goals.filter(g => g.id !== goal.id) })); setShowMenu(false); }} style={{ display: "block", width: "100%", padding: "10px 14px", background: "none", border: "none", color: "#f87171", textAlign: "left", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>🗑 Remove goal</button>
              </div>
            )}
          </div>
        </div>
        {/* Coach note section */}
        {goal.status === "active" && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.05)" }}>
            {isNote && coachNote.text ? (
              <div style={{ fontSize: 12, color: "rgba(245,240,232,.7)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{coachNote.text}</div>
            ) : (
              <button onClick={() => getCoachNote(goal)} disabled={isNote && coachNote.loading} style={{
                background: "none", border: "none", color: "var(--gold)", fontSize: 12, cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif", padding: 0, opacity: isNote && coachNote.loading ? 0.5 : 1,
              }}>
                {isNote && coachNote.loading ? "Getting coaching…" : `${coach.emoji} Get coaching on this goal`}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "30px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ color: "var(--gold)", fontSize: 26, marginBottom: 2 }}>My Goals</h2>
          <div style={{ fontSize: 12, color: "rgba(245,240,232,.35)" }}>
            {active.length} active · {completed.length} completed
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-outline" style={{ fontSize: 11, padding: "7px 12px" }} onClick={() => { setAnswers({}); setQIndex(0); setProposedGoals([]); setSelectedGoals([]); setStep("questionnaire"); }}>Rebuild</button>
        </div>
      </div>

      {/* Analytics insights banner */}
      {analyticsInsights.length > 0 && (
        <div style={{ background: "rgba(74,144,217,.08)", border: "1px solid rgba(74,144,217,.25)", borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
          <button onClick={() => setShowInsights(s => !s)} style={{ background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer", padding: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#4a90d9" }}>📊 {coach.name} has {analyticsInsights.length} suggestion{analyticsInsights.length !== 1 ? "s" : ""} based on your recent rounds</span>
              <span style={{ color: "#4a90d9", fontSize: 12 }}>{showInsights ? "▲" : "▼"}</span>
            </div>
          </button>
          {showInsights && (
            <div style={{ marginTop: 12 }}>
              {analyticsInsights.map((ins, i) => {
                const alreadyAdded = allGoals.some(g => g.text === ins.text);
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 0", borderTop: i > 0 ? "1px solid rgba(255,255,255,.05)" : "none", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cream)", marginBottom: 2 }}>{ins.text}</div>
                      <div style={{ fontSize: 11, color: "rgba(245,240,232,.45)", lineHeight: 1.5 }}>{ins.insight}</div>
                    </div>
                    {!alreadyAdded ? (
                      <button onClick={() => {
                        const goal = { id: `ana_${Date.now()}`, text: ins.text, cat: ins.cat, why: ins.insight, source: "analytics", status: "active", createdAt: new Date().toLocaleDateString(), updates: [] };
                        setPlan(p => ({ ...(p||{}), goals: [...(p?.goals||[]), goal] }));
                      }} style={{ flexShrink: 0, padding: "5px 10px", borderRadius: 6, border: "1px solid rgba(74,144,217,.4)", background: "rgba(74,144,217,.12)", color: "#4a90d9", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>+ Add</button>
                    ) : (
                      <span style={{ fontSize: 11, color: "#4caf78", flexShrink: 0 }}>✓ Added</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Active goals */}
      {active.length === 0 && allGoals.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🎯</div>
          <p style={{ color: "rgba(245,240,232,.5)", marginBottom: 16 }}>No goals set yet.</p>
          <button className="btn-gold" onClick={() => setStep("intro")}>Set My Goals →</button>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(245,240,232,.35)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>Active Goals</div>
              {active.map(g => <GoalCard key={g.id} goal={g} />)}
            </>
          )}
          {paused.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(245,240,232,.25)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10, marginTop: 20 }}>Paused</div>
              {paused.map(g => <GoalCard key={g.id} goal={g} />)}
            </>
          )}
          {completed.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#4caf78", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10, marginTop: 20, opacity: 0.6 }}>Completed 🎉</div>
              {completed.map(g => <GoalCard key={g.id} goal={g} />)}
            </>
          )}
        </>
      )}

      {/* Add goal manually */}
      <div style={{ marginTop: 16 }}>
        {!showAddGoal ? (
          <button className="btn-outline" onClick={() => setShowAddGoal(true)} style={{ width: "100%" }}>+ Add a Goal</button>
        ) : (
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", marginBottom: 12 }}>Add Your Own Goal</div>
            <label className="field-label">Category</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {GOAL_CATS.map(c => (
                <button key={c.id} onClick={() => setNewGoalCat(c.id)} style={{
                  padding: "5px 10px", borderRadius: 20, border: "1px solid",
                  borderColor: newGoalCat === c.id ? c.color : "var(--border)",
                  background: newGoalCat === c.id ? `${c.color}20` : "transparent",
                  color: newGoalCat === c.id ? c.color : "rgba(245,240,232,.5)",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                }}>{c.icon} {c.label}</button>
              ))}
            </div>
            <label className="field-label">Goal</label>
            <input className="field-input" placeholder="e.g. Develop a consistent pre-shot routine for every shot" value={newGoalText} onChange={e => setNewGoalText(e.target.value)} style={{ marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-gold" onClick={addManualGoal} disabled={!newGoalText.trim()} style={{ flex: 2 }}>Add Goal</button>
              <button className="btn-outline" onClick={() => { setShowAddGoal(false); setNewGoalText(""); }} style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// ── Shared club utilities ─────────────────────────────────────────────────────
const CLUBS = [
  { id: "driver", label: "Driver",   category: "woods"   },
  { id: "3w",     label: "3 Wood",   category: "woods"   },
  { id: "5w",     label: "5 Wood",   category: "woods"   },
  { id: "7w",     label: "7 Wood",   category: "woods"   },
  { id: "2h",     label: "2 Hybrid", category: "hybrids" },
  { id: "3h",     label: "3 Hybrid", category: "hybrids" },
  { id: "4h",     label: "4 Hybrid", category: "hybrids" },
  { id: "5h",     label: "5 Hybrid", category: "hybrids" },
  { id: "3i",     label: "3 Iron",   category: "irons"   },
  { id: "4i",     label: "4 Iron",   category: "irons"   },
  { id: "5i",     label: "5 Iron",   category: "irons"   },
  { id: "6i",     label: "6 Iron",   category: "irons"   },
  { id: "7i",     label: "7 Iron",   category: "irons"   },
  { id: "8i",     label: "8 Iron",   category: "irons"   },
  { id: "9i",     label: "9 Iron",   category: "irons"   },
  { id: "pw",     label: "PW",       category: "wedges"  },
  { id: "gw",     label: "GW / AW",  category: "wedges"  },
  { id: "sw",     label: "SW",       category: "wedges"  },
  { id: "lw",     label: "LW / 60°", category: "wedges"  },
];

const RANGE_METRICS = [
  { key: "carry",       label: "Carry",      unit: "yds", color: "var(--gold)"  },
  { key: "total",       label: "Total",      unit: "yds", color: "#4caf78"      },
  { key: "ballSpeed",   label: "Ball Speed", unit: "mph", color: "#4a90d9"      },
  { key: "clubSpeed",   label: "Club Speed", unit: "mph", color: "#9b7de8"      },
  { key: "smashFactor", label: "Smash",      unit: "",    color: "#e8c96a"      },
  { key: "spinRate",    label: "Spin Rate",  unit: "rpm", color: "#e07a30"      },
  { key: "launchAngle", label: "Launch",     unit: "°",   color: "#4caf78"      },
  { key: "peakHeight",  label: "Apex",       unit: "yds", color: "#c8763a"      },
];

function calcClubAverages(clubId, rangeSessions) {
  const metrics = {};
  RANGE_METRICS.forEach(m => {
    const entries = rangeSessions
      .filter(s => s.shots?.[clubId]?.[m.key] && s.shots?.[clubId]?.shots)
      .map(s => ({ val: Number(s.shots[clubId][m.key]), shots: Number(s.shots[clubId].shots) }))
      .filter(e => e.val > 0 && e.shots > 0);
    if (entries.length === 0) return;
    const totalShots = entries.reduce((s, e) => s + e.shots, 0);
    const weighted   = entries.reduce((s, e) => s + e.val * e.shots, 0);
    metrics[m.key] = Math.round((weighted / totalShots) * 10) / 10;
  });
  return metrics;
}

// ── My Bag ────────────────────────────────────────────────────────────────────
function MyBag({ inBag, setInBag, rangeSessions }) {
  const [clubInfo, setClubInfo] = useState(null);
  const [sessionLimit, setSessionLimit] = useState("all"); // "all" | "10" | "5"
  const DEFAULT_BAG = ["driver","3w","5h","4i","5i","6i","7i","8i","9i","pw","gw","sw"];
  const bagSet = inBag.length > 0 ? inBag : DEFAULT_BAG;
  const CAT_LABELS = { woods: "Woods", hybrids: "Hybrids", irons: "Irons", wedges: "Wedges" };

  const hasAnySessions = rangeSessions.length > 0;
  const limitedSessions = sessionLimit === "all" ? rangeSessions
    : rangeSessions.slice(0, Number(sessionLimit));

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "30px 20px" }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ color: "var(--gold)", fontSize: 26, marginBottom: 4 }}>My Bag</h2>
        <p style={{ fontSize: 12, color: "rgba(245,240,232,.4)", lineHeight: 1.6 }}>
          Tick the clubs you carry. Distances are calculated automatically from your practice sessions.
        </p>
      </div>

      {/* Session limit filter */}
      {hasAnySessions && (
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {[
            { value: "all", label: "All sessions" },
            { value: "10",  label: "Last 10" },
            { value: "5",   label: "Last 5" },
          ].map(opt => (
            <button key={opt.value} onClick={() => setSessionLimit(opt.value)} style={{
              flex: 1, padding: "7px 4px", borderRadius: 7, border: "1px solid",
              borderColor: sessionLimit === opt.value ? "var(--gold)" : "var(--border)",
              background: sessionLimit === opt.value ? "rgba(200,168,75,.12)" : "transparent",
              color: sessionLimit === opt.value ? "var(--gold)" : "rgba(245,240,232,.4)",
              cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
              fontSize: 12, transition: "all .15s",
            }}>{opt.label}</button>
          ))}
        </div>
      )}

      {["woods","hybrids","irons","wedges"].map(cat => (
        <div key={cat} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(245,240,232,.35)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>
            {CAT_LABELS[cat]}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {CLUBS.filter(c => c.category === cat).map(club => {
              const active = bagSet.includes(club.id);
              const avgs   = active && hasAnySessions ? calcClubAverages(club.id, limitedSessions) : {};
              const hasData = Object.keys(avgs).length > 0 && avgs.carry;
              return (
                <div key={club.id} style={{
                  background: active ? "var(--card-bg)" : "rgba(255,255,255,.02)",
                  border: `1px solid ${active ? "var(--border)" : "rgba(255,255,255,.06)"}`,
                  borderRadius: 10, padding: "12px 14px",
                  display: "flex", alignItems: "center", gap: 12,
                  opacity: active ? 1 : 0.4, transition: "all .15s",
                }}>
                  {/* Checkbox */}
                  <button onClick={() => setInBag(prev =>
                    prev.includes(club.id) ? prev.filter(c => c !== club.id) : [...prev, club.id]
                  )} style={{
                    width: 20, height: 20, borderRadius: 4, flexShrink: 0, border: "2px solid",
                    borderColor: active ? "var(--gold)" : "rgba(255,255,255,.2)",
                    background: active ? "var(--gold)" : "transparent",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, color: "var(--green-deep)", fontWeight: 800,
                  }}>{active ? "✓" : ""}</button>

                  {/* Club name */}
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: active ? "var(--cream)" : "rgba(245,240,232,.3)" }}>
                    {club.label}
                  </span>

                  {/* Distance / status */}
                  {active && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {hasData ? (
                        <>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--gold)", lineHeight: 1 }}>{Math.round(avgs.carry)}<span style={{ fontSize: 10, fontWeight: 400, color: "rgba(200,168,75,.6)", marginLeft: 2 }}>yds</span></div>
                            <div style={{ fontSize: 9, color: "rgba(245,240,232,.3)", textTransform: "uppercase" }}>carry avg</div>
                          </div>
                          <button onClick={() => setClubInfo(club.id)} style={{
                            background: "rgba(255,255,255,.06)", border: "1px solid var(--border)",
                            borderRadius: 6, padding: "5px 10px", cursor: "pointer",
                            fontSize: 11, color: "rgba(245,240,232,.6)", fontFamily: "'DM Sans',sans-serif",
                          }}>Club Info</button>
                        </>
                      ) : (
                        <span style={{ fontSize: 11, color: "rgba(245,240,232,.25)", fontStyle: "italic" }}>
                          {hasAnySessions ? "no data yet" : "log a session"}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {!hasAnySessions && (
        <div style={{ background: "rgba(200,168,75,.06)", border: "1px solid rgba(200,168,75,.15)", borderRadius: 12, padding: "16px 18px", textAlign: "center", marginTop: 8 }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>🎯</div>
          <div style={{ fontSize: 13, color: "rgba(245,240,232,.6)", lineHeight: 1.6 }}>
            Club distances will be calculated automatically once you log a log practice session.
          </div>
        </div>
      )}

      {/* Club Info modal */}
      {clubInfo && (() => {
        const club = CLUBS.find(c => c.id === clubInfo);
        const avgs = calcClubAverages(clubInfo, limitedSessions);
        const sessionCount = limitedSessions.filter(s => s.shots?.[clubInfo]?.shots).length;
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <div style={{ background: "var(--green-deep)", border: "1px solid var(--border)", borderRadius: "16px 16px 0 0", padding: "24px 20px", width: "100%", maxWidth: 500, maxHeight: "70vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <h3 style={{ color: "var(--gold)", fontSize: 20 }}>{club?.label}</h3>
                <button onClick={() => setClubInfo(null)} style={{ background: "none", border: "none", color: "rgba(245,240,232,.5)", fontSize: 22, cursor: "pointer" }}>✕</button>
              </div>
              <div style={{ fontSize: 11, color: "rgba(245,240,232,.35)", marginBottom: 18 }}>
                Weighted average across {sessionCount} session{sessionCount !== 1 ? "s" : ""}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {RANGE_METRICS.map(m => (
                  <div key={m.key} style={{ background: "rgba(0,0,0,.2)", borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontSize: 11, color: m.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".3px", marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--cream)" }}>
                      {avgs[m.key] != null ? avgs[m.key] : "—"}
                      <span style={{ fontSize: 11, color: "rgba(245,240,232,.35)", marginLeft: 3 }}>{m.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ── Log Practice Session ─────────────────────────────────────────────────────────────
function RangeSession({ inBag, rangeSessions, setRangeSessions }) {
  const [view, setView]           = useState("landing"); // "landing" | "log" | "history"
  const [session, setSession]     = useState({
    date: new Date().toISOString().split("T")[0],
    location: "", source: "Trackman", notes: "", shots: {},
  });
  const [saved, setSaved]         = useState(false);

  // Scan flow state
  const [scanStep, setScanStep]   = useState("idle"); // "idle" | "preview" | "scanning" | "review"
  const [scanImg, setScanImg]     = useState(null);
  const [scanB64, setScanB64]     = useState(null);
  const [scanError, setScanError] = useState("");
  const scanInputRef              = useRef();

  const bagClubs = CLUBS.filter(c => inBag.includes(c.id));

  function updShot(clubId, key, val) {
    setSession(s => ({ ...s, shots: { ...s.shots, [clubId]: { ...(s.shots[clubId] || {}), [key]: val } } }));
  }

  function pickScanAndGo(f) {
    if (!f) return;
    setScanImg(URL.createObjectURL(f));
    setScanError("");
    const reader = new FileReader();
    reader.onload = e => { setScanB64(e.target.result.split(",")[1]); setScanStep("preview"); setView("log"); };
    reader.readAsDataURL(f);
  }

  function saveSession() {
    const s = { ...session, id: Date.now(), savedAt: new Date().toLocaleDateString() };
    setRangeSessions(rs => [s, ...rs]);
    setSession({ date: new Date().toISOString().split("T")[0], location: "", source: "Trackman", notes: "", shots: {} });
    setSaved(true);
    setScanStep("idle"); setScanImg(null); setScanB64(null);
    setTimeout(() => { setSaved(false); setView("landing"); }, 1500);
  }

  async function runScan() {
    setScanStep("scanning");
    setScanError("");
    try {
      const clubList = bagClubs.map(c => c.label).join(", ");
      const system = `You are a golf data parser. Extract launch monitor data from this image. Return ONLY a JSON object — no other text, no markdown.
Format: { "source": "device name if visible", "date": "YYYY-MM-DD if visible or null", "location": "facility name if visible or null", "clubs": { "clubId": { "shots": number, "carry": number, "total": number, "ballSpeed": number, "clubSpeed": number, "smashFactor": number, "spinRate": number, "launchAngle": number, "peakHeight": number } } }
Club IDs to use: driver, 3w, 5w, 7w, 2h, 3h, 4h, 5h, 3i, 4i, 5i, 6i, 7i, 8i, 9i, pw, gw, sw, lw.
Map club names from the image to these IDs (e.g. "D" or "Driver" → driver, "7I" → 7i, "PW" → pw).
Only include clubs that actually appear in the image. Omit metrics not present. Use null for unknown values.
The player's bag contains: ${clubList}`;
      const result = await askClaude({
        system,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: scanB64 } },
          { type: "text", text: "Extract all launch monitor data from this image." },
        ]}],
      });
      const clean = result.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      const newShots = {};
      Object.entries(parsed.clubs || {}).forEach(([clubId, data]) => {
        const cleaned = {};
        Object.entries(data).forEach(([k, v]) => { if (v !== null && v !== undefined && v !== "") cleaned[k] = String(v); });
        if (Object.keys(cleaned).length > 0) newShots[clubId] = cleaned;
      });
      setSession(s => ({
        ...s, shots: { ...s.shots, ...newShots },
        source: parsed.source || s.source,
        date:   parsed.date   || s.date,
        location: parsed.location || s.location,
      }));
      setScanStep("review");
    } catch (e) {
      setScanError("Couldn't parse the image — check your connection or enter data manually.");
      setScanStep("preview");
    }
  }

  // ── Landing view ──────────────────────────────────────────────────────────────
  if (view === "landing") return (
    <div style={{ maxWidth: 580, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h2 style={{ color: "var(--gold)", fontSize: 26, marginBottom: 4 }}>Log Practice Session</h2>
          <p style={{ fontSize: 12, color: "rgba(245,240,232,.4)" }}>How would you like to log this session?</p>
        </div>
        <button className="btn-outline" style={{ fontSize: 12 }} onClick={() => setView("history")}>History</button>
      </div>

      {/* Hidden file input */}
      <input ref={scanInputRef} type="file" accept="image/*" capture="environment"
        onChange={e => pickScanAndGo(e.target.files[0])} />

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Scan option */}
        <button onClick={() => scanInputRef.current?.click()} style={{
          background: "var(--card-bg)", border: "2px solid rgba(200,168,75,.35)",
          borderRadius: 16, padding: "28px 24px", cursor: "pointer", textAlign: "left",
          transition: "all .15s", fontFamily: "'DM Sans',sans-serif",
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📷</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: "var(--gold)", marginBottom: 8 }}>
            Scan Session Summary
          </div>
          <div style={{ fontSize: 14, color: "rgba(245,240,232,.65)", lineHeight: 1.6 }}>
            Take or upload a photo of your Trackman, FlightScope, or any launch monitor summary screen. Your coach will extract the data automatically.
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: "var(--gold)", fontWeight: 700 }}>
            Tap to open camera →
          </div>
        </button>

        {/* Manual option */}
        <button onClick={() => setView("log")} style={{
          background: "var(--card-bg)", border: "2px solid var(--border)",
          borderRadius: 16, padding: "28px 24px", cursor: "pointer", textAlign: "left",
          transition: "all .15s", fontFamily: "'DM Sans',sans-serif",
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⌨️</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: "var(--cream)", marginBottom: 8 }}>
            Enter Manually
          </div>
          <div style={{ fontSize: 14, color: "rgba(245,240,232,.65)", lineHeight: 1.6 }}>
            Type in distances and stats club by club. Useful for estimated carry distances or when you don't have a screenshot.
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: "rgba(245,240,232,.5)", fontWeight: 700 }}>
            Open data entry →
          </div>
        </button>
      </div>

      {rangeSessions.length > 0 && (
        <div style={{ marginTop: 20, fontSize: 12, color: "rgba(245,240,232,.3)", textAlign: "center" }}>
          {rangeSessions.length} session{rangeSessions.length !== 1 ? "s" : ""} logged
        </div>
      )}
    </div>
  );

  // ── Log view ─────────────────────────────────────────────────────────────────
  if (view === "log") return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "30px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="btn-outline" style={{ fontSize: 12, padding: "6px 10px" }} onClick={() => setView("landing")}>←</button>
          <h2 style={{ color: "var(--gold)", fontSize: 22 }}>{scanStep === "review" ? "Review Extracted Data" : "Enter Manually"}</h2>
        </div>
        <button className="btn-outline" style={{ fontSize: 12 }} onClick={() => setView("history")}>History</button>
      </div>
      <p style={{ fontSize: 12, color: "rgba(245,240,232,.4)", marginBottom: 20, lineHeight: 1.6 }}>
        Include shots per club to enable weighted averages across sessions.
      </p>

      {/* Preview step */}
      {(scanStep === "preview" || scanStep === "scanning") && scanImg && (
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px", marginBottom: 20 }}>
          <img src={scanImg} alt="scan" style={{ width: "100%", borderRadius: 8, maxHeight: 240, objectFit: "contain", marginBottom: 14 }} />
          {scanError && <div style={{ fontSize: 12, color: "#f87171", marginBottom: 12, lineHeight: 1.5 }}>{scanError}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            {scanStep === "preview" && (
              <>
                <button className="btn-gold" onClick={runScan} style={{ flex: 2 }}>Extract Data →</button>
                <button className="btn-outline" onClick={() => { setScanStep("idle"); setScanImg(null); setScanB64(null); }} style={{ flex: 1 }}>Cancel</button>
              </>
            )}
            {scanStep === "scanning" && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--gold)", fontSize: 13 }}>
                <div className="spinner" />Extracting data from image…
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review banner — shown after successful scan */}
      {scanStep === "review" && (
        <div style={{ background: "rgba(76,175,120,.1)", border: "1px solid rgba(76,175,120,.3)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#4caf78", marginBottom: 2 }}>✓ Data extracted — please review</div>
            <div style={{ fontSize: 12, color: "rgba(245,240,232,.5)" }}>Check the values below and correct anything that looks off before saving.</div>
          </div>
          <button onClick={() => { setScanStep("idle"); setScanImg(null); setScanB64(null); }} style={{
            flexShrink: 0, background: "none", border: "1px solid rgba(255,255,255,.15)", borderRadius: 6,
            color: "rgba(245,240,232,.5)", fontSize: 11, cursor: "pointer", padding: "5px 10px",
            fontFamily: "'DM Sans',sans-serif",
          }}>Clear scan</button>
        </div>
      )}

      {/* Session details */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
        <div>
          <label className="field-label">Date</label>
          <input type="date" className="field-input" value={session.date}
            onChange={e => setSession(s => ({ ...s, date: e.target.value }))}
            style={{ colorScheme: "dark", maxWidth: 200 }} />
        </div>
        <div>
          <label className="field-label">Source</label>
          <select className="field-input" value={session.source}
            onChange={e => setSession(s => ({ ...s, source: e.target.value }))}
            style={{ colorScheme: "dark" }}>
            {["Trackman","FlightScope","Foresight GC","SkyTrak","Garmin R10","Rapsodo","Manual / Estimated","Other"].map(o => (
              <option key={o} value={o} style={{ background: "#1a4731" }}>{o}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label className="field-label">Location / Facility <span style={{ fontWeight: 400, color: "rgba(245,240,232,.3)" }}>(optional)</span></label>
        <input className="field-input" placeholder="e.g. TopGolf, Home Sim, Driving Range"
          value={session.location} onChange={e => setSession(s => ({ ...s, location: e.target.value }))} />
      </div>

      {/* Scrollable club grid */}
      <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(245,240,232,.4)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>
        Club Data — enter what you have, leave the rest blank
      </div>
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", marginBottom: 20 }}>
        <div style={{ minWidth: 640 }}>
          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "90px 60px repeat(8, 1fr)", gap: 4, marginBottom: 6 }}>
            <div style={{ fontSize: 10, color: "rgba(245,240,232,.3)" }}></div>
            <div style={{ fontSize: 9, color: "rgba(245,240,232,.5)", textAlign: "center", fontWeight: 700 }}>SHOTS</div>
            {RANGE_METRICS.map(m => (
              <div key={m.key} style={{ fontSize: 9, color: m.color, textAlign: "center", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".2px" }}>
                {m.label}<br /><span style={{ color: "rgba(245,240,232,.25)", fontWeight: 400 }}>{m.unit}</span>
              </div>
            ))}
          </div>
          {/* Club rows */}
          {bagClubs.map(club => (
            <div key={club.id} style={{ display: "grid", gridTemplateColumns: "90px 60px repeat(8, 1fr)", gap: 4, marginBottom: 4, alignItems: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--cream)" }}>{club.label}</div>
              {/* Shots count — special gold highlight */}
              <input type="number" placeholder="—" min="1" max="200"
                value={session.shots[club.id]?.shots || ""}
                onChange={e => updShot(club.id, "shots", e.target.value)}
                style={{
                  textAlign: "center", background: "rgba(200,168,75,.1)",
                  border: "1px solid rgba(200,168,75,.3)", borderRadius: 4,
                  color: "var(--gold)", fontSize: 12, padding: "5px 0",
                  fontFamily: "'DM Sans',sans-serif", outline: "none", width: "100%",
                }} />
              {/* Metric inputs */}
              {RANGE_METRICS.map(m => (
                <input key={m.key} type="number" placeholder="—"
                  value={session.shots[club.id]?.[m.key] || ""}
                  onChange={e => updShot(club.id, m.key, e.target.value)}
                  style={{
                    textAlign: "center", background: "rgba(0,0,0,.25)",
                    border: "1px solid rgba(255,255,255,.08)", borderRadius: 4,
                    color: "var(--cream)", fontSize: 12, padding: "5px 0",
                    fontFamily: "'DM Sans',sans-serif", outline: "none", width: "100%",
                  }} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {bagClubs.length === 0 && (
        <div style={{ fontSize: 13, color: "rgba(245,240,232,.4)", textAlign: "center", padding: "20px 0" }}>
          Add clubs to your bag first in My Bag.
        </div>
      )}

      {/* Notes */}
      <div style={{ marginBottom: 20 }}>
        <label className="field-label">Session Notes <span style={{ fontWeight: 400, color: "rgba(245,240,232,.3)" }}>(optional)</span></label>
        <textarea className="field-input" rows={2}
          placeholder="e.g. Working on driver, new shaft, windy conditions"
          value={session.notes} onChange={e => setSession(s => ({ ...s, notes: e.target.value }))} />
      </div>

      <button className="btn-gold" onClick={saveSession} disabled={bagClubs.length === 0}>
        {saved ? "✓ Session Saved!" : "Save Practice Session"}
      </button>
      {saved && <div style={{ fontSize: 13, color: "#4caf78", marginTop: 10 }}>Club averages updated in My Bag.</div>}
    </div>
  );

  // ── History view ──────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "30px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: "var(--gold)", fontSize: 26 }}>Session History</h2>
        <button className="btn-gold" style={{ width: "auto", padding: "10px 16px", fontSize: 13 }} onClick={() => setView("log")}>+ Log Session</button>
      </div>
      {rangeSessions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🎯</div>
          <p style={{ color: "rgba(245,240,232,.4)" }}>No sessions logged yet.</p>
        </div>
      ) : rangeSessions.map((s, i) => {
        const clubsLogged = Object.keys(s.shots || {}).filter(k => s.shots[k]?.carry);
        return (
          <div key={s.id} className="card fade-up" style={{ padding: "16px 18px", marginBottom: 12, animationDelay: `${i * 0.04}s` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--cream)", marginBottom: 2 }}>{s.location || "Log Practice Session"}</div>
                <div style={{ fontSize: 12, color: "rgba(245,240,232,.4)" }}>
                  {formatDate(s.date)} · {s.source} · {clubsLogged.length} club{clubsLogged.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {clubsLogged.map(clubId => {
                const club = CLUBS.find(c => c.id === clubId);
                const d = s.shots[clubId];
                return (
                  <div key={clubId} style={{ background: "rgba(0,0,0,.2)", borderRadius: 6, padding: "5px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>{d.carry}</div>
                    <div style={{ fontSize: 9, color: "rgba(245,240,232,.35)", textTransform: "uppercase" }}>{club?.label}</div>
                    {d.shots && <div style={{ fontSize: 9, color: "rgba(245,240,232,.25)" }}>{d.shots} shots</div>}
                  </div>
                );
              })}
            </div>
            {s.notes && <div style={{ fontSize: 12, color: "rgba(245,240,232,.4)", marginTop: 8, fontStyle: "italic" }}>{s.notes}</div>}
          </div>
        );
      })}
    </div>
  );
}

const HANDICAP_RANGES = ["Beginner (no official HCP)", "Over 30", "21–30", "11–20", "6–10", "0–5", "Scratch or better"];
const PLAY_FREQ_OPTS  = ["A few times a year", "Monthly", "A few times a month", "Weekly", "Multiple times a week"];
const GOAL_OPTS       = ["Break 120", "Break 100", "Break 90", "Break 80", "Break 70", "Lower my index", "Compete & win"];

function Profile({ profile, setProfile, coach, setCoach, savedRounds, audioEnabled, setAudioEnabled, navigate, onSaveNew }) {
  const isNew = !profile?.name;
  const [draft, setDraft] = useState(profile || {
    name: "", homeCourse: "", handicap: "", playFreq: "", goal: "", units: "yards", bio: "",
  });
  const [saved, setSaved] = useState(false);

  function upd(k, v) { setDraft(d => ({ ...d, [k]: v })); }

  function save() {
    if (!draft.name.trim()) return;
    setProfile(draft);
    setSaved(true);
    if (isNew) {
      setTimeout(() => onSaveNew && onSaveNew(), 800);
    } else {
      setTimeout(() => setSaved(false), 2000);
    }
  }

  const hcp = savedRounds.length >= 3 ? calcHandicapIndex(savedRounds.filter(r => (r.roundType || "course") === "course")) : null;
  const totalRounds = savedRounds.length;
  const courseRounds = savedRounds.filter(r => (r.roundType || "course") === "course").length;
  const simRounds    = savedRounds.filter(r => r.roundType === "simulator").length;

  const avatar = draft.name ? draft.name.charAt(0).toUpperCase() : "?";

  return (
    <div style={{ maxWidth: 580, margin: "0 auto", padding: "30px 20px" }}>

      {/* Header */}
      <div className="fade-up" style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%", margin: "0 auto 14px",
          background: draft.name ? "linear-gradient(135deg, var(--green-bright), var(--green-mid))" : "var(--card-bg)",
          border: "2px solid var(--border)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 32, fontWeight: 900, color: "var(--gold)",
        }}>
          {draft.name ? avatar : "👤"}
        </div>
        <h2 style={{ color: "var(--gold)", fontSize: 26, marginBottom: 4 }}>
          {isNew ? "Set Up Your Profile" : (profile.name || "My Profile")}
        </h2>
        {isNew && (
          <p style={{ color: "rgba(245,240,232,.5)", fontSize: 13, lineHeight: 1.6 }}>
            Personalizes your coaching experience across the whole app.
          </p>
        )}
      </div>

      {/* Stats summary — only if rounds exist */}
      {totalRounds > 0 && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24,
        }}>
          {[
            { label: "Handicap Index", value: hcp !== null ? hcp : "—", sub: "WHS calculated" },
            { label: "Rounds Tracked", value: totalRounds, sub: `${courseRounds} course · ${simRounds} sim` },
            { label: "Avg Score", value: (() => {
              const r = savedRounds.slice(0, 10);
              const totals = r.map(rd => calcStats(rd.holes).total).filter(Boolean);
              return totals.length ? Math.round(totals.reduce((a,b) => a+b,0) / totals.length) : "—";
            })(), sub: "last 10 rounds" },
          ].map(s => (
            <div key={s.label} style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--gold)", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "rgba(245,240,232,.35)", marginTop: 3, textTransform: "uppercase", letterSpacing: ".3px" }}>{s.label}</div>
              <div style={{ fontSize: 9, color: "rgba(245,240,232,.25)", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Name */}
        <div>
          <label className="field-label">Your Name *</label>
          <input className="field-input" placeholder="e.g. Charlie" value={draft.name}
            onChange={e => upd("name", e.target.value)} />
        </div>

        {/* Home course */}
        <div>
          <label className="field-label">Home Course</label>
          <input className="field-input" placeholder="e.g. Augusta National" value={draft.homeCourse}
            onChange={e => upd("homeCourse", e.target.value)} />
        </div>

        {/* Handicap */}
        <div>
          <label className="field-label">Current Handicap Range</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {HANDICAP_RANGES.map(h => (
              <button key={h} onClick={() => upd("handicap", h)} style={{
                padding: "7px 12px", borderRadius: 20, border: "1px solid",
                borderColor: draft.handicap === h ? "var(--gold)" : "var(--border)",
                background: draft.handicap === h ? "rgba(200,168,75,.14)" : "rgba(255,255,255,.04)",
                color: draft.handicap === h ? "var(--gold)" : "rgba(245,240,232,.6)",
                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                transition: "all .15s",
              }}>{h}</button>
            ))}
          </div>
        </div>

        {/* Play frequency */}
        <div>
          <label className="field-label">How Often Do You Play?</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {PLAY_FREQ_OPTS.map(f => (
              <button key={f} onClick={() => upd("playFreq", f)} style={{
                padding: "7px 12px", borderRadius: 20, border: "1px solid",
                borderColor: draft.playFreq === f ? "var(--gold)" : "var(--border)",
                background: draft.playFreq === f ? "rgba(200,168,75,.14)" : "rgba(255,255,255,.04)",
                color: draft.playFreq === f ? "var(--gold)" : "rgba(245,240,232,.6)",
                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                transition: "all .15s",
              }}>{f}</button>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div>
          <label className="field-label">Primary Goal</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {GOAL_OPTS.map(g => (
              <button key={g} onClick={() => upd("goal", g)} style={{
                padding: "7px 12px", borderRadius: 20, border: "1px solid",
                borderColor: draft.goal === g ? "var(--gold)" : "var(--border)",
                background: draft.goal === g ? "rgba(200,168,75,.14)" : "rgba(255,255,255,.04)",
                color: draft.goal === g ? "var(--gold)" : "rgba(245,240,232,.6)",
                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                transition: "all .15s",
              }}>{g}</button>
            ))}
          </div>
        </div>

        {/* Units */}
        <div>
          <label className="field-label">Preferred Units</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["yards", "metres"].map(u => (
              <button key={u} onClick={() => upd("units", u)} style={{
                flex: 1, padding: "10px", borderRadius: 8, border: "2px solid",
                borderColor: draft.units === u ? "var(--gold)" : "var(--border)",
                background: draft.units === u ? "rgba(200,168,75,.12)" : "transparent",
                color: draft.units === u ? "var(--gold)" : "rgba(245,240,232,.5)",
                fontWeight: 600, fontSize: 14, cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif", textTransform: "capitalize",
                transition: "all .15s",
              }}>{u}</button>
            ))}
          </div>
        </div>

        {/* Bio / notes */}
        <div>
          <label className="field-label">Anything else your coach should know? <span style={{ fontWeight: 400, color: "rgba(245,240,232,.3)" }}>(optional)</span></label>
          <textarea className="field-input" rows={3}
            placeholder="e.g. recovering from a back injury, play mostly links courses, left-handed"
            value={draft.bio} onChange={e => upd("bio", e.target.value)} />
        </div>

        {/* Coach selector */}
        <div>
          <label className="field-label">Your Coach</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {COACHES.map(c => (
              <button key={c.id} onClick={() => setCoach(c)} style={{
                padding: "12px 8px", borderRadius: 10, border: "2px solid",
                borderColor: coach.id === c.id ? c.color : "var(--border)",
                background: coach.id === c.id ? `${c.color}22` : "var(--card-bg)",
                cursor: "pointer", textAlign: "center", transition: "all .15s",
              }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{c.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: coach.id === c.id ? c.color : "var(--cream)" }}>{c.name}</div>
                <div style={{ fontSize: 10, color: "rgba(245,240,232,.4)", marginTop: 2 }}>{c.style}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Audio toggle */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cream)", marginBottom: 2 }}>Coach Audio</div>
            <div style={{ fontSize: 12, color: "rgba(245,240,232,.4)" }}>Coach reads feedback aloud (Caddy + Swing)</div>
          </div>
          <button onClick={() => { setAudioEnabled(a => !a); if (audioEnabled) stopSpeech(); }} style={{
            width: 48, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
            background: audioEnabled ? "var(--green-bright)" : "rgba(255,255,255,.15)",
            position: "relative", transition: "background .2s",
          }}>
            <div style={{
              position: "absolute", top: 3, left: audioEnabled ? 24 : 3,
              width: 20, height: 20, borderRadius: "50%", background: "#fff",
              transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.3)",
            }} />
          </button>
        </div>

      </div>

      {/* Save */}
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
        <button className="btn-gold" onClick={save} disabled={!draft.name.trim()}>
          {saved ? "✓ Saved! Taking you to goals…" : isNew ? "Create Profile →" : "Save Changes"}
        </button>
        {!isNew && !draft.name.trim() && (
          <div style={{ fontSize: 12, color: "rgba(245,240,232,.35)", textAlign: "center" }}>
            Enter your name to save
          </div>
        )}
        {isNew && !saved && (
          <button className="btn-outline" style={{ fontSize: 12 }} onClick={() => onSaveNew && onSaveNew()}>
            Skip for now
          </button>
        )}
      </div>

      {/* Future auth note */}
      <div style={{ marginTop: 20, padding: "12px 14px", background: "rgba(0,0,0,.15)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 10 }}>
        <div style={{ fontSize: 11, color: "rgba(245,240,232,.3)", lineHeight: 1.6 }}>
          🔒 <strong style={{ color: "rgba(245,240,232,.45)" }}>Coming in the full app:</strong> Cloud sync, login across devices, and secure backup of all your rounds and coaching history.
        </div>
      </div>
    </div>
  );
}

// ── Onboarding Tour ───────────────────────────────────────────────────────────
const TOUR_STEPS = [
  { id: "plan",      icon: "📋", label: "My Goals",             pitch: "Set 3–5 specific goals for your game. Your coach tracks progress, surfaces new targets as your rounds are logged, and adjusts recommendations as your game evolves." },
  { id: "mybag",     icon: "🏌", label: "My Bag",               pitch: "Tell Scratch which clubs you carry. Once you log practice sessions, carry distances are calculated automatically and fed into your on-course caddy." },
  { id: "range",     icon: "🎯", label: "Log Practice Session",  pitch: "Log data from any launch monitor — Trackman, Foresight, Garmin R10, or just carry estimates. Scratch tracks your numbers over time so you can see real improvement." },
  { id: "analytics", icon: "📈", label: "Game Analytics",        pitch: "Your handicap index, fairways, GIR, putting stats and scoring trends — all in one place. The more rounds you log, the smarter your coaching gets." },
  { id: "score",     icon: "📊", label: "Scorecard",             pitch: "Log rounds manually, load a saved course, or scan a printed scorecard with your camera. Tracks every stat that matters." },
  { id: "caddy",     icon: "🧍", label: "On-Course Caddy",       pitch: "Describe your shot situation and your coach gives you three options — safe, percentage, and hero — with a clear recommendation. Uses your actual club distances." },
  { id: "lessons",   icon: "📚", label: "Lessons",               pitch: "19 structured lessons across every area of the game, written in the voice of your chosen coach. Each one links directly to relevant drills." },
  { id: "swing",     icon: "🏌", label: "Swing Analyzer",        pitch: "Upload a still photo of your swing and your coach gives you a detailed breakdown — positions, faults, and the two or three things most worth fixing right now. For a full analysis, upload photos at address, top of backswing, and impact." },
  { id: "drills",    icon: "🎪", label: "Drill Library",         pitch: "87 drills across Full Swing, Short Game, Putting, Driver, Mental, Course Management and more. Filter by category or specific problem — slice, fat shots, yips, lag putting." },
  { id: "mental",    icon: "🧠", label: "Mental Game",           pitch: "10 deep-dive concepts covering the inner game — from pre-shot routine and focus under pressure to handling adversity and building confidence. Each one includes a practice exercise you can take onto the course." },
];

function OnboardingTour({ coach, onFinish }) {
  const [step, setStep] = useState(0);
  const [_showMenu, _setShowMenu] = useState(false);
  const current = TOUR_STEPS[step];
  const isLast  = step === TOUR_STEPS.length - 1;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", flexDirection: "column" }}>
      {/* Dimmed background */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(6,15,10,.92)", backdropFilter: "blur(4px)" }} />

      {/* Mock nav bar — shows menu highlight on first step */}
      <div style={{
        position: "relative", zIndex: 1,
        background: "rgba(13,40,24,.98)", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px", height: 58,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--green-bright), var(--green-mid))", border: "2px solid var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "var(--gold)" }}>
            {coach.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, color: "var(--gold)" }}>Scratch</div>
            <div style={{ fontSize: 9, color: "rgba(245,240,232,.35)", textTransform: "uppercase", letterSpacing: ".3px" }}>Tour</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ padding: "5px 10px", borderRadius: 20, border: "1px solid var(--border)", fontSize: 15 }}>🔇</div>
          {/* Hamburger — highlighted on first step with pulse */}
          <div style={{
            padding: "7px 10px", borderRadius: 8,
            border: `1px solid ${step === 0 ? "var(--gold)" : "var(--border)"}`,
            background: step === 0 ? "rgba(200,168,75,.2)" : "transparent",
            display: "flex", flexDirection: "column", gap: 4,
            animation: step === 0 ? "pulse 1.5s ease-in-out infinite" : "none",
          }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 18, height: 2, borderRadius: 2, background: step === 0 ? "var(--gold)" : "rgba(245,240,232,.7)" }} />)}
          </div>
        </div>
      </div>

      {/* Menu panel — always visible during tour */}
      <div style={{
        position: "relative", zIndex: 1,
        width: 260, marginLeft: "auto",
        background: "rgba(13,40,24,.98)", borderLeft: "1px solid var(--border)",
        flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch",
      }}>
        {/* Coach badge */}
        <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>{coach.emoji}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)" }}>{coach.name}</div>
            <div style={{ fontSize: 10, color: "rgba(245,240,232,.35)" }}>{coach.style}</div>
          </div>
        </div>
        {/* Home item */}
        <div style={{ padding: "13px 18px", borderBottom: "1px solid rgba(255,255,255,.04)", display: "flex", alignItems: "center", gap: 12, color: "rgba(245,240,232,.5)", fontSize: 14 }}>
          <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>🏠</span>Home
        </div>
        <div style={{ padding: "13px 18px", borderBottom: "1px solid rgba(255,255,255,.04)", display: "flex", alignItems: "center", gap: 12, color: "rgba(245,240,232,.5)", fontSize: 14 }}>
          <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>👤</span>My Profile
        </div>
        {/* Tour items — highlight current */}
        {TOUR_STEPS.map((item, i) => {
          const isActive = i === step;
          return (
            <div key={item.id} style={{
              padding: "13px 18px",
              borderBottom: i < TOUR_STEPS.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
              background: isActive ? "rgba(200,168,75,.15)" : "transparent",
              display: "flex", alignItems: "center", gap: 12,
              color: isActive ? "var(--gold)" : "rgba(245,240,232,.4)",
              fontSize: 14, fontWeight: isActive ? 700 : 400,
              transition: "all .3s",
              borderLeft: isActive ? "3px solid var(--gold)" : "3px solid transparent",
            }}>
              <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{item.icon}</span>
              {item.label}
              {isActive && <span style={{ marginLeft: "auto", fontSize: 10 }}>◀</span>}
            </div>
          );
        })}
      </div>

      {/* Pitch card — full width bottom, flips to top from Scorecard onwards */}
      <div style={{
        position: "fixed",
        bottom: step < 4 ? 0 : "auto",
        top:    step >= 4 ? 58 : "auto",
        left: 0, right: 0, zIndex: 2,
        background: "var(--green-deep)",
        borderTop:    step < 4  ? "2px solid var(--gold)" : "none",
        borderBottom: step >= 4 ? "2px solid var(--gold)" : "none",
        borderRadius: step < 4 ? "20px 20px 0 0" : "0 0 20px 20px",
        padding: "22px 24px 32px",
        animation: "slideUp .25s ease-out",
        boxShadow: step >= 4 ? "0 8px 32px rgba(0,0,0,.5)" : "0 -4px 32px rgba(0,0,0,.4)",
      }}>
          {/* Progress dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 18 }}>
            {TOUR_STEPS.map((_, i) => (
              <div key={i} style={{
                width: i === step ? 20 : 6, height: 6, borderRadius: 3,
                background: i === step ? "var(--gold)" : i < step ? "rgba(200,168,75,.4)" : "rgba(255,255,255,.15)",
                transition: "all .3s",
              }} />
            ))}
          </div>

          {/* Feature name */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 28 }}>{current.icon}</span>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: "var(--gold)" }}>
              {current.label}
            </div>
          </div>

          {/* Pitch */}
          <p style={{ fontSize: 14, color: "rgba(245,240,232,.8)", lineHeight: 1.7, marginBottom: 22 }}>
            {current.pitch}
          </p>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-outline" style={{ flex: 1 }}>← Back</button>
            )}
            <button onClick={() => isLast ? onFinish() : setStep(s => s + 1)} className="btn-gold" style={{ flex: 2 }}>
              {isLast ? "Let's go →" : "Next →"}
            </button>
            {!isLast && (
              <button onClick={onFinish} style={{
                background: "none", border: "none", color: "rgba(245,240,232,.35)",
                fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", padding: "0 8px",
              }}>Skip</button>
            )}
          </div>
      </div>
    </div>
  );
}

// ── Help & Feedback ───────────────────────────────────────────────────────────
const FAQS = [
  { q: "Why doesn't the Swing Analyzer work with video?", a: "Currently Scratch analyzes still photos. For the best results, shoot slow-motion video on your phone then screenshot 2-4 key positions — address, top of backswing, impact, and follow-through — and upload those. Full video analysis is coming in a future update." },
  { q: "Why can't I generate my Action Plan / Goals?", a: "Goal generation and AI coaching features require a live internet connection and an active Scratch account. Make sure you're connected and try again. You can always add goals manually in the meantime." },
  { q: "Is my Scratch handicap official?", a: "Your Scratch handicap is calculated using the World Handicap System (WHS) formula — the same maths used by the USGA. However it's an estimated index, not an official GHIN handicap, which requires membership of an affiliated club. Use it as an accurate guide to track your progress." },
  { q: "How are my club distances calculated?", a: "Club distances are calculated automatically as weighted averages from your Log Practice Sessions. The more sessions you log, the more accurate the averages become. You'll need to log at least one session with shot counts per club to see distances in My Bag." },
  { q: "Why does the app ask for a profile on first launch?", a: "Your profile personalises every part of the coaching experience — your name, handicap, goals and preferred coach are used throughout the app to make advice and recommendations specific to you." },
  { q: "Will my data be saved if I close the app?", a: "Yes. Scratch saves all your rounds, goals, bag data, sessions and settings automatically. Your data persists between sessions on the same device." },
  { q: "How do I change my coach?", a: "Tap your profile avatar in the top left, scroll down to the Coach section, and tap a new coach. Your coaching voice and style will update immediately across the app." },
  { q: "What does the audio toggle do?", a: "When audio is enabled (🔊), your coach will read responses aloud in the Caddy and Swing Analyzer after each response. Useful when you're on the course and can't look at your screen. Toggle it with the speaker icon in the top nav." },
  { q: "How do I reset or clear my data?", a: "You can clear your session history from the History page. To reset all data, you can clear your browser storage in your device settings. A full account reset option is coming in the next update." },
];

function Help({ coach }) {
  const [tab, setTab]           = useState("faq"); // "faq" | "ask" | "bug" | "feedback"
  const [openFaq, setOpenFaq]   = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer]     = useState("");
  const [answering, setAnswering] = useState(false);
  const [bugForm, setBugForm]   = useState({ page: "", happened: "", expected: "" });
  const [feedbackText, setFeedbackText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const TABS = [
    { id: "faq",      label: "FAQ",         icon: "💡" },
    { id: "ask",      label: "Ask",         icon: "💬" },
    { id: "bug",      label: "Report Bug",  icon: "🐛" },
    { id: "feedback", label: "Feedback",    icon: "⭐" },
  ];

  async function askQuestion() {
    if (!question.trim()) return;
    setAnswering(true); setAnswer("");
    try {
      const system = `You are ${coach.name}, the Scratch golf coaching app assistant. Answer user questions about the Scratch app helpfully and concisely. If it's a golf question, answer it in your coaching voice. If it's a technical app question, be clear and direct. Keep answers under 150 words.`;
      const result = await askClaude({ system, messages: [{ role: "user", content: question }] });
      setAnswer(result);
    } catch (e) {
      setAnswer("Couldn't get an answer right now — check your connection and try again.");
    } finally {
      setAnswering(false);
    }
  }

  async function submitBug() {
    if (!bugForm.happened.trim()) return;
    try {
      await fetch("https://formspree.io/f/myklpyjl", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          type: "Bug Report",
          page: bugForm.page || "Not specified",
          happened: bugForm.happened,
          expected: bugForm.expected || "Not specified",
        }),
      });
    } catch (e) {}
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setBugForm({ page: "", happened: "", expected: "" }); }, 3000);
  }

  async function submitFeedback() {
    if (!feedbackText.trim()) return;
    try {
      await fetch("https://formspree.io/f/myklpyjl", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          type: "Feedback",
          message: feedbackText,
        }),
      });
    } catch (e) {}
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setFeedbackText(""); }, 3000);
  }

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "30px 20px" }}>
      <h2 style={{ color: "var(--gold)", fontSize: 26, marginBottom: 4 }}>Help & Feedback</h2>
      <p style={{ fontSize: 12, color: "rgba(245,240,232,.4)", marginBottom: 20 }}>
        Got a question, found a bug, or have an idea? We're listening.
      </p>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, background: "rgba(0,0,0,.2)", borderRadius: 10, padding: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setSubmitted(false); }} style={{
            flex: 1, padding: "8px 4px", borderRadius: 7, border: "none",
            background: tab === t.id ? "rgba(200,168,75,.18)" : "transparent",
            color: tab === t.id ? "var(--gold)" : "rgba(245,240,232,.45)",
            fontSize: 11, fontWeight: 600, cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif", transition: "all .15s",
          }}>
            <div style={{ fontSize: 16, marginBottom: 2 }}>{t.icon}</div>
            {t.label}
          </button>
        ))}
      </div>

      {/* FAQ */}
      {tab === "faq" && (
        <div>
          {FAQS.map((faq, i) => (
            <div key={i} style={{
              background: "var(--card-bg)", border: `1px solid ${openFaq === i ? "var(--gold)" : "var(--border)"}`,
              borderRadius: 10, marginBottom: 8, overflow: "hidden", transition: "border-color .2s",
            }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                width: "100%", padding: "14px 16px", background: "none", border: "none",
                color: "var(--cream)", textAlign: "left", cursor: "pointer",
                fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
              }}>
                <span style={{ flex: 1, lineHeight: 1.4 }}>{faq.q}</span>
                <span style={{ color: "var(--gold)", fontSize: 16, flexShrink: 0 }}>{openFaq === i ? "▲" : "▼"}</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 16px 14px", fontSize: 13, color: "rgba(245,240,232,.7)", lineHeight: 1.7 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Ask a question */}
      {tab === "ask" && (
        <div>
          <div style={{ fontSize: 12, color: "rgba(245,240,232,.45)", marginBottom: 14, lineHeight: 1.6 }}>
            Ask {coach.emoji} {coach.name} anything — about the app, your game, or golf in general.
          </div>
          <textarea className="field-input" rows={3}
            placeholder={`e.g. How do I fix my slice? Or: how does the handicap calculation work?`}
            value={question} onChange={e => setQuestion(e.target.value)}
            style={{ marginBottom: 10 }} />
          <button className="btn-gold" onClick={askQuestion} disabled={!question.trim() || answering}>
            {answering
              ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><div className="spinner" />Thinking…</span>
              : `Ask ${coach.name} →`}
          </button>
          {answer && (
            <div style={{ marginTop: 16, background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px" }}>
              <div style={{ fontSize: 11, color: "var(--gold)", fontWeight: 700, marginBottom: 8 }}>{coach.emoji} {coach.name}</div>
              <div style={{ fontSize: 13, color: "rgba(245,240,232,.8)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{answer}</div>
            </div>
          )}
        </div>
      )}

      {/* Report a bug */}
      {tab === "bug" && (
        <div>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 16, color: "#4caf78", fontWeight: 700 }}>Bug reported — thank you!</div>
              <div style={{ fontSize: 13, color: "rgba(245,240,232,.45)", marginTop: 8 }}>We'll look into it.</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 12, color: "rgba(245,240,232,.45)", marginBottom: 16, lineHeight: 1.6 }}>
                Help us fix it. The more detail the better.
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="field-label">Which part of the app?</label>
                <select className="field-input" value={bugForm.page}
                  onChange={e => setBugForm(b => ({ ...b, page: e.target.value }))}
                  style={{ colorScheme: "dark" }}>
                  <option value="">Select a section…</option>
                  {["Home","My Profile","My Goals","My Bag","Log Practice Session","Game Analytics","Scorecard","On-Course Caddy","Lessons","Swing Analyzer","Drill Library","Mental Game","History","Onboarding / Tour","Other"].map(o => (
                    <option key={o} value={o} style={{ background: "#1a4731" }}>{o}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="field-label">What happened?</label>
                <textarea className="field-input" rows={3}
                  placeholder="e.g. The app crashed when I tapped Save Round"
                  value={bugForm.happened} onChange={e => setBugForm(b => ({ ...b, happened: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="field-label">What did you expect to happen? <span style={{ fontWeight: 400, color: "rgba(245,240,232,.3)" }}>(optional)</span></label>
                <textarea className="field-input" rows={2}
                  placeholder="e.g. The round should have saved and taken me to the rounds list"
                  value={bugForm.expected} onChange={e => setBugForm(b => ({ ...b, expected: e.target.value }))} />
              </div>
              <button className="btn-gold" onClick={submitBug} disabled={!bugForm.happened.trim()}>
                Submit Bug Report
              </button>
            </>
          )}
        </div>
      )}

      {/* Feedback */}
      {tab === "feedback" && (
        <div>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🙌</div>
              <div style={{ fontSize: 16, color: "var(--gold)", fontWeight: 700 }}>Feedback received — thank you!</div>
              <div style={{ fontSize: 13, color: "rgba(245,240,232,.45)", marginTop: 8 }}>This genuinely helps us improve Scratch.</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 12, color: "rgba(245,240,232,.45)", marginBottom: 16, lineHeight: 1.6 }}>
                Ideas, feature requests, things you love or things that could be better — all welcome.
              </div>
              <textarea className="field-input" rows={6}
                placeholder="e.g. It would be great to be able to edit a round after saving. Also love the caddy feature — use it every round."
                value={feedbackText} onChange={e => setFeedbackText(e.target.value)}
                style={{ marginBottom: 20 }} />
              <button className="btn-gold" onClick={submitFeedback} disabled={!feedbackText.trim()}>
                Send Feedback
              </button>
            </>
          )}
        </div>
      )}

      {/* Footer note */}
      <div style={{ marginTop: 32, padding: "12px 14px", background: "rgba(0,0,0,.15)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 10 }}>
        <div style={{ fontSize: 11, color: "rgba(245,240,232,.3)", lineHeight: 1.6 }}>
          📧 You can also reach us directly at <span style={{ color: "rgba(200,168,75,.6)" }}>hello@playscratch.com</span>
        </div>
      </div>
    </div>
  );
}



// Storage keys
const KEYS = {
  coach:          'scratch:coach',
  savedRounds:    'scratch:rounds',
  courses:        'scratch:courses',
  plan:           'scratch:plan',
  swingInsights:  'scratch:insights',
  history:        'scratch:history',
  audioEnabled:   'scratch:audio',
  profile:        'scratch:profile',
  inBag:          'scratch:inbag',
  rangeSessions:  'scratch:range',
  onboarded:      'scratch:onboarded',
};

// Hook: load once from storage, sync writes back
function usePersistedState(key, defaultVal) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  });
  const [loaded, setLoaded] = useState(true);

  function setAndPersist(valOrFn) {
    setValue(prev => {
      const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch (e) {}
      return next;
    });
  }

  return [value, setAndPersist, loaded];
}

export default function App() {
  const [page, setPage]   = useState("home");
  const [drillCtx, setDrillCtx] = useState("");
  const [firstLoad, setFirstLoad] = useState(true);
  const topRef = useRef(null);

  // Persisted state
  const [coach,         setCoach,         coachLoaded]    = usePersistedState(KEYS.coach,         COACHES[0]);
  const [savedRounds,   setSavedRounds,   roundsLoaded]   = usePersistedState(KEYS.savedRounds,   []);
  const [courses,       setCourses,       coursesLoaded]  = usePersistedState(KEYS.courses,       []);
  const [plan,          setPlan,          planLoaded]     = usePersistedState(KEYS.plan,          null);
  const [swingInsights, setSwingInsights, insightsLoaded] = usePersistedState(KEYS.swingInsights, []);
  const [history,       setHistory,       historyLoaded]  = usePersistedState(KEYS.history,       []);
  const [audioEnabled,    setAudioEnabled,    audioLoaded]    = usePersistedState(KEYS.audioEnabled,   false);
  const [profile,         setProfile,         profileLoaded]  = usePersistedState(KEYS.profile,         null);
  const [inBag,           setInBag,           inBagLoaded]    = usePersistedState(KEYS.inBag,           ["driver","3w","5h","4i","5i","6i","7i","8i","9i","pw","gw","sw"]);
  const [rangeSessions,   setRangeSessions,   rangeLoaded]    = usePersistedState(KEYS.rangeSessions,   []);
  const [_onboarded,       setOnboarded,       onboardedLoaded] = usePersistedState(KEYS.onboarded,      false);

  const allLoaded = coachLoaded && roundsLoaded && coursesLoaded && planLoaded && insightsLoaded && historyLoaded && audioLoaded && profileLoaded && inBagLoaded && rangeLoaded && onboardedLoaded;

  const [showTour, setShowTour] = useState(false);
  const [showTourPrompt, setShowTourPrompt] = useState(false);

  // On first load, send new users to profile setup
  if (allLoaded && firstLoad) {
    setFirstLoad(false);
    if (!profile?.name) setPage("profile");
  }

  function addHistory(item) {
    setHistory(h => [item, ...h].slice(0, 50));
    if (item.type === "swing" && item.preview) {
      setSwingInsights(si => [item.preview, ...si].slice(0, 10));
    }
  }

  function navigate(p) {
    setPage(p);
    setTimeout(() => topRef.current?.scrollIntoView({ block: "start", behavior: "instant" }), 0);
  }

  function goSwing(drillContext) {
    setDrillCtx(drillContext || "");
    navigate("swing");
  }

  function handleSaveRound(round) {
    setSavedRounds(s => [round, ...s]);
  }

  function handleUpdateRound(updated) {
    setSavedRounds(s => s.map(r => r.id === updated.id ? updated : r));
  }

  function handleDeleteRound(id) {
    setSavedRounds(s => s.filter(r => r.id !== id));
  }

  // Loading screen while storage hydrates
  if (!allLoaded) return (
    <>
      <GlobalStyle />
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 20% 20%, #1a4731 0%, #0d2818 55%, #060f0a 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 900, color: "var(--gold)" }}>Scratch</div>
        <div className="spinner" />
      </div>
    </>
  );

  function handleOnboarded() {
    setOnboarded(true);
    setShowTour(false);
    navigate("home");
  }

  function handleProfileSaveNew() {
    navigate("plan");
    sessionStorage.setItem("scratch:pendingTour", "1");
  }

  const pages = {
    home:      <Home         coach={coach} setCoach={setCoach} go={navigate} profile={profile} />,
    lessons:   <Lessons      coach={coach} addHistory={addHistory} goSwing={goSwing} />,
    swing:     <Swing        coach={coach} addHistory={addHistory} prefillDrill={drillCtx} clearDrill={() => setDrillCtx("")} audioEnabled={audioEnabled} />,
    caddy:     <Caddy        coach={coach} addHistory={addHistory} audioEnabled={audioEnabled} inBag={inBag} rangeSessions={rangeSessions} />,
    score:     <Score        savedRounds={savedRounds} onSaveRound={handleSaveRound} onUpdateRound={handleUpdateRound} onDeleteRound={handleDeleteRound} courses={courses} setCourses={setCourses} />,
    analytics: <Analytics    savedRounds={savedRounds} coach={coach} rangeSessions={rangeSessions} />,
    drills:    <Drills       goSwing={goSwing} />,
    mental:    <Mental />,
    plan:      <ActionPlan   coach={coach} plan={plan} setPlan={setPlan} savedRounds={savedRounds} swingInsights={swingInsights}
                  onGoalsComplete={() => { if (sessionStorage.getItem("scratch:pendingTour")) { sessionStorage.removeItem("scratch:pendingTour"); setShowTourPrompt(true); } }} />,
    mybag:     <MyBag        inBag={inBag} setInBag={setInBag} rangeSessions={rangeSessions} />,
    range:     <RangeSession inBag={inBag} rangeSessions={rangeSessions} setRangeSessions={setRangeSessions} />,
    profile:   <Profile      profile={profile} setProfile={setProfile} coach={coach} setCoach={setCoach} savedRounds={savedRounds} audioEnabled={audioEnabled} setAudioEnabled={setAudioEnabled} navigate={navigate} onSaveNew={handleProfileSaveNew} />,
    history:   <History      history={history} clear={() => setHistory([])} />,
    help:      <Help         coach={coach} />,
  };

  return (
    <>
      <GlobalStyle />
      <div ref={topRef} />
      <div style={{ position: "fixed", inset: 0, zIndex: -1, background: "radial-gradient(ellipse at 20% 20%, #1a4731 0%, #0d2818 55%, #060f0a 100%)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(200,168,75,.012) 40px,rgba(200,168,75,.012) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(200,168,75,.012) 40px,rgba(200,168,75,.012) 41px)" }} />
      </div>
      <Nav active={page} setActive={navigate} coach={coach} audioEnabled={audioEnabled} setAudioEnabled={setAudioEnabled} profile={profile} onProfileClick={() => navigate("profile")} />
      <main style={{ minHeight: "calc(100vh - 58px)" }}>{pages[page]}</main>

      {/* Tour prompt modal */}
      {showTourPrompt && !showTour && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.65)", backdropFilter: "blur(4px)" }} onClick={() => { setShowTourPrompt(false); navigate("home"); }} />
          <div style={{
            position: "relative", background: "var(--green-deep)", border: "1px solid var(--border)",
            borderRadius: 20, padding: "32px 24px", maxWidth: 380, width: "100%",
            textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,.5)",
            animation: "slideUp .25s ease-out",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏌</div>
            <h3 style={{ color: "var(--gold)", fontSize: 22, fontFamily: "'Playfair Display',serif", marginBottom: 10 }}>
              You're all set, {profile?.name?.split(" ")[0] || "golfer"}!
            </h3>
            <p style={{ color: "rgba(245,240,232,.65)", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              Scratch has a lot to offer. Would you like a quick tour of everything in the app?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button className="btn-gold" onClick={() => { setShowTourPrompt(false); setShowTour(true); }}>
                Show me around →
              </button>
              <button className="btn-outline" onClick={() => { setShowTourPrompt(false); handleOnboarded(); }}>
                Skip — I'll explore myself
              </button>
            </div>
          </div>
        </div>
      )}

      {showTour && <OnboardingTour coach={coach} onFinish={handleOnboarded} />}
    </>
  );
}
