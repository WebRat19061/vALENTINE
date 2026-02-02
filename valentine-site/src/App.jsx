import { useEffect, useMemo, useRef, useState } from "react";


export default function App() {
  // 🔒 Secret Password Gate
  const SECRET_PASSWORD = "VAISHU"; // CHANGE THIS
  const [unlocked, setUnlocked] = useState(false);
  const [pass, setPass] = useState("");
  const [wrong, setWrong] = useState(false);

  // ⏳ Timer
  const [seconds, setSeconds] = useState(0);

  // 💖 Buttons / UI
  const [yesClicked, setYesClicked] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);

  // 😂 No button runs away
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [noMoved, setNoMoved] = useState(false);

  // 🎶 Music
  const audioRef = useRef(null);
  const [musicOn, setMusicOn] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // 📸 Photo upload + slideshow
  const [photos, setPhotos] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);

  // ⏳ Countdown (CHANGE DATE)
  const nextMeetDate = useMemo(() => new Date("2026-02-14T00:00:00"), []);
  const [countdown, setCountdown] = useState(getCountdown(nextMeetDate));

  // 💌 Typing letter
  const fullLetter = `My love,
I don’t need a special day to love you…
but today I want to remind you that you’re my favorite part of life.

You are my comfort, my happiness, and my forever.
Happy Valentine’s Day ❤️`;

  const [typedLetter, setTypedLetter] = useState("");

  // Love quotes
  const loveQuotes = useMemo(
    () => [
      "You are my favorite notification 💌",
      "My heart chose you—again and again ❤️",
      "You make ordinary days feel magical ✨",
      "I’m grateful for you, always 🌙",
      "If love had a face, it would look like you 💖",
    ],
    []
  );

  const quote = loveQuotes[seconds % loveQuotes.length];

  // Tick timer
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Countdown tick
  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(getCountdown(nextMeetDate));
    }, 1000);
    return () => clearInterval(t);
  }, [nextMeetDate]);

  // Slideshow auto-play
  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex((i) => (i + 1) % photos.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [photos]);

  // 🎶 Autoplay-safe music unlock: first click anywhere
  useEffect(() => {
    const unlockAudio = async () => {
      setAudioUnlocked(true);
      window.removeEventListener("click", unlockAudio);

      // if user already pressed play earlier, try again now
      if (musicOn && audioRef.current) {
        try {
          await audioRef.current.play();
        } catch {}
      }
    };

    window.addEventListener("click", unlockAudio);
    return () => window.removeEventListener("click", unlockAudio);
  }, [musicOn]);

  // 💌 Typing effect when letter opens
  useEffect(() => {
    if (!showLetter) return;
    setTypedLetter("");
    let i = 0;

    const t = setInterval(() => {
      i++;
      setTypedLetter(fullLetter.slice(0, i));
      if (i >= fullLetter.length) clearInterval(t);
    }, 18);

    return () => clearInterval(t);
  }, [showLetter]);

  // Password unlock
  const handleUnlock = () => {
    if (pass.trim().toLowerCase() === SECRET_PASSWORD.toLowerCase()) {
      setUnlocked(true);
      setWrong(false);
    } else {
      setWrong(true);
    }
  };

  // YES clicked 🎆
  const handleYes = () => {
    setYesClicked(true);
    setHeartBurst(true);
    setTimeout(() => setHeartBurst(false), 1200);

    // Confetti + fireworks
    launchConfetti();
    setTimeout(() => launchConfetti(), 350);
    setTimeout(() => launchFireworks(), 650);
  };

  // NO button runs away 😭
  const moveNoButton = () => {
    const maxX = 240;
    const maxY = 100;
    const randomX = Math.floor(Math.random() * maxX) - maxX / 2;
    const randomY = Math.floor(Math.random() * maxY) - maxY / 2;
    setNoPos({ x: randomX, y: randomY });
    setNoMoved(true);
  };

  // Music toggle
  const toggleMusic = async () => {
    if (!audioRef.current) return;

    try {
      if (!musicOn) {
        setMusicOn(true);
        if (audioUnlocked) await audioRef.current.play();
      } else {
        audioRef.current.pause();
        setMusicOn(false);
      }
    } catch {
      // No alert needed now (we unlock on first click)
      setMusicOn(true);
    }
  };

  // Upload photos
  const handleUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const urls = files.map((f) => URL.createObjectURL(f));
    setPhotos((prev) => [...prev, ...urls]);
  };

  const nextSlide = () => {
    if (!photos.length) return;
    setSlideIndex((i) => (i + 1) % photos.length);
  };

  const prevSlide = () => {
    if (!photos.length) return;
    setSlideIndex((i) => (i - 1 + photos.length) % photos.length);
  };

  // 📱 Swipe for slideshow (mobile)
  const touchRef = useRef({ x: 0, y: 0 });
  const onTouchStart = (e) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const dx = endX - touchRef.current.x;
    if (Math.abs(dx) > 40) {
      if (dx < 0) nextSlide();
      else prevSlide();
    }
  };

  if (!unlocked) {
    return (
      <div style={styles.lockPage}>
        <FloatingHearts />
        <HeartCursorTrail />

        <div style={styles.lockCard}>
          <h1 style={styles.lockTitle}>🔒 Secret Valentine Page</h1>
          <p style={styles.lockText}>
            Enter the password to open your surprise 💖
          </p>

          <input
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Password..."
            style={styles.lockInput}
          />

          <button style={styles.primaryBtn} onClick={handleUnlock}>
            Unlock 💘
          </button>

          {wrong && (
            <div style={styles.wrongText}>
              ❌ Wrong password… try again cutie 😭
            </div>
          )}

          <div style={styles.hintText}>
            Hint: It's what I → <b>CALL YOU</b> all uppercase
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <FloatingHearts />
      <HeartCursorTrail />

      {/* Romantic music */}
      <audio
        ref={audioRef}
        loop
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      />

      <header style={styles.header}>
        <div style={styles.brand}>
          <span style={styles.logo}>💘</span>
          <span style={styles.brandText}>Happy Valentine’s Day</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={styles.musicBtn} onClick={toggleMusic}>
            {musicOn ? "⏸ Pause Music" : "🎶 Play Music"}
          </button>

          <div style={styles.timer}>
            ⏳ Together in this moment: <b>{seconds}s</b>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* Countdown */}
        <div style={styles.countdownCard}>
          <div style={styles.countdownTitle}>💞 Countdown to Our Next Meet</div>
          <div style={styles.countdownNumbers}>
            <div style={styles.countBox}>
              <div style={styles.countNum}>{countdown.days}</div>
              <div style={styles.countLabel}>Days</div>
            </div>
            <div style={styles.countBox}>
              <div style={styles.countNum}>{countdown.hours}</div>
              <div style={styles.countLabel}>Hours</div>
            </div>
            <div style={styles.countBox}>
              <div style={styles.countNum}>{countdown.minutes}</div>
              <div style={styles.countLabel}>Minutes</div>
            </div>
            <div style={styles.countBox}>
              <div style={styles.countNum}>{countdown.seconds}</div>
              <div style={styles.countLabel}>Seconds</div>
            </div>
          </div>
        </div>

        <section style={styles.heroCard}>
          <h1 style={styles.title}>
            Hey <span style={styles.name}>My Paglu</span> 💞
          </h1>

          <p style={styles.subtitle}>
            This website is a small universe… and you are the center of it ✨
          </p>

          <div style={styles.quoteBox}>
            <span style={styles.quoteIcon}>💬</span>
            <span style={styles.quoteText}>{quote}</span>
          </div>

          <div style={styles.buttons}>
            <button style={styles.primaryBtn} onClick={handleYes}>
              Will you be my Valentine? YES🌹
            </button>

            <button
              style={{
                ...styles.noBtn,
                transform: `translate(${noPos.x}px, ${noPos.y}px)`,
              }}
              onMouseEnter={moveNoButton}
              onClick={moveNoButton}
            >
              No 😭
            </button>

            <button
              style={styles.secondaryBtn}
              onClick={() => setShowLetter((v) => !v)}
            >
              {showLetter ? "Hide Love Letter 💌" : "Open Love Letter 💌"}
            </button>
          </div>

          {noMoved && (
            <div style={styles.tinyText}>
              😂 Nice try… you can’t say no today.
            </div>
          )}

          {heartBurst && <BurstHearts />}

          {yesClicked && (
            <div style={styles.successBox}>
              <h2 style={styles.successTitle}>YAYYYYY!!! 😭❤️</h2>
              <p style={styles.successText}>
                You just made my whole universe brighter ✨
              </p>
            </div>
          )}
        </section>

        <section style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🌸 Why I Love You</h3>
            <ul style={styles.list}>
              <li>💗 You make me feel safe.</li>
              <li>💗 You’re my peace and my chaos (in the best way).</li>
              <li>💗 Your smile fixes everything.</li>
              <li>💗 You’re my favorite person forever.</li>
              <li>💗 You're my favorite kiss.</li>
              <li>💗 You’re my favorite paglu.</li>
            </ul>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📸 Our Photo Slideshow</h3>
            <p style={styles.cardText}>
              Upload photos & swipe left/right on mobile 💕
            </p>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              style={styles.fileInput}
            />

            <div
              style={styles.slideshow}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {photos.length > 0 ? (
                <>
                  <img
                    src={photos[slideIndex]}
                    alt="slideshow"
                    style={styles.slideImg}
                  />

                  <div style={styles.slideControls}>
                    <button style={styles.slideBtn} onClick={prevSlide}>
                      ⬅️
                    </button>
                    <div style={styles.slideCount}>
                      {slideIndex + 1} / {photos.length}
                    </div>
                    <button style={styles.slideBtn} onClick={nextSlide}>
                      ➡️
                    </button>
                  </div>
                </>
              ) : (
                <div style={styles.emptySlide}>
                  Upload photos to start the slideshow 💕
                </div>
              )}
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🎁 Surprise</h3>
            <p style={styles.cardText}>Click this when you miss me 🥺</p>
            <button
              style={styles.primaryBtn}
              onClick={() =>
                alert("I love you more than words can ever say ❤️")
              }
            >
              Tap for a Surprise 💝
            </button>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>💌 Love Letter</h3>
            <p style={styles.cardText}>
              A small note from my heart to yours.
            </p>

            {showLetter ? (
              <div style={styles.letter}>
                <pre style={styles.letterPre}>{typedLetter}</pre>
                <div style={styles.cursorBlink}>▍</div>
              </div>
            ) : (
              <div style={styles.mutedBox}>
                Tap “Open Love Letter 💌” above ✨
              </div>
            )}
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        Made with ❤️ for the most beautiful girl [My Vaishu] in the world.
      </footer>
    </div>
  );
}

/* ---------------- Helpers ---------------- */

function getCountdown(targetDate) {
  const now = new Date().getTime();
  const diff = Math.max(0, targetDate.getTime() - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

/* 🎉 Confetti */
function launchConfetti() {
  const count = 80;
  for (let i = 0; i < count; i++) {
    const conf = document.createElement("div");
    conf.className = "confetti";
    conf.style.left = Math.random() * 100 + "vw";
    conf.style.top = "-10px";
    conf.style.transform = `rotate(${Math.random() * 360}deg)`;
    conf.style.animationDuration = 1.8 + Math.random() * 1.4 + "s";
    document.body.appendChild(conf);

    setTimeout(() => conf.remove(), 3200);
  }
}

/* 🎆 Fireworks */
function launchFireworks() {
  const burst = document.createElement("div");
  burst.className = "firework";
  burst.style.left = 20 + Math.random() * 60 + "vw";
  burst.style.top = 15 + Math.random() * 40 + "vh";
  document.body.appendChild(burst);

  setTimeout(() => burst.remove(), 1500);
}

/* ---------------- Components ---------------- */

function FloatingHearts() {
  return (
    <div style={styles.heartsWrap}>
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          style={{
            ...styles.heart,
            left: `${(i * 7) % 100}%`,
            animationDelay: `${(i % 6) * 0.6}s`,
            fontSize: `${14 + (i % 5) * 6}px`,
            opacity: 0.18 + (i % 4) * 0.14,
          }}
        >
          ❤️
        </span>
      ))}
    </div>
  );
}

function BurstHearts() {
  return (
    <div style={styles.burst}>
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          style={{
            ...styles.burstHeart,
            transform: `translate(${Math.cos(i) * 90}px, ${
              Math.sin(i) * 70
            }px)`,
            animationDelay: `${i * 0.04}s`,
          }}
        >
          💖
        </span>
      ))}
    </div>
  );
}

function HeartCursorTrail() {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    const handleMove = (e) => {
      const id = Date.now() + Math.random();
      const newHeart = { id, x: e.clientX, y: e.clientY };
      setHearts((prev) => [...prev.slice(-18), newHeart]);

      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== id));
      }, 650);
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div style={styles.cursorLayer}>
      {hearts.map((h) => (
        <span
          key={h.id}
          style={{
            ...styles.cursorHeart,
            left: h.x,
            top: h.y,
          }}
        >
          💗
        </span>
      ))}
    </div>
  );
}

/* ---------------- Styles ---------------- */

const styles = {
  lockPage: {
    width: "100%",
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(255,180,200,0.55), rgba(255,255,255,1))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    padding: 16,
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },

  lockCard: {
    width: "100%",
    maxWidth: 520,
    textAlign: "center",
    background: "rgba(255,255,255,0.92)",
    borderRadius: 28,
    padding: 22,
    border: "1px solid rgba(255,47,104,0.16)",
    boxShadow: "0 18px 50px rgba(255,47,104,0.14)",
  },

  lockTitle: { margin: 0, fontWeight: 1000, fontSize: 28 },
  lockText: { marginTop: 10, opacity: 0.8, fontWeight: 650 },

  lockInput: {
    width: "100%",
    marginTop: 14,
    padding: "14px 14px",
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.12)",
    outline: "none",
    fontWeight: 800,
    fontSize: 16,
  },

  wrongText: {
    marginTop: 12,
    fontWeight: 900,
    color: "#ff2f68",
  },

  hintText: {
    marginTop: 12,
    opacity: 0.7,
    fontWeight: 700,
  },

  page: {
    width: "100%",
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(255,180,200,0.55), rgb(249, 206, 252))",
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
    color: "#1f1f1f",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  header: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    position: "sticky",
    top: 0,
    backdropFilter: "blur(12px)",
    background: "rgba(255,255,255,0.65)",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    zIndex: 10,
  },

  brand: { display: "flex", alignItems: "center", gap: 10 },
  logo: { fontSize: 22 },
  brandText: { fontWeight: 900, letterSpacing: 0.3 },

  timer: {
    fontSize: 14,
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(0,0,0,0.06)",
    fontWeight: 800,
  },

  musicBtn: {
    border: "none",
    padding: "10px 14px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 900,
    background: "linear-gradient(90deg, #ff2f68, #a855f7)",
    color: "white",
    boxShadow: "0 10px 20px rgba(255,47,104,0.20)",
  },

  main: {
    width: "100%",
    maxWidth: 1200,
    padding: "26px 18px 50px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  countdownCard: {
    width: "100%",
    maxWidth: 1100,
    borderRadius: 26,
    padding: 16,
    marginBottom: 16,
    background:
      "linear-gradient(90deg, rgba(255,47,104,0.12), rgba(168,85,247,0.10))",
    border: "1px solid rgba(255,47,104,0.16)",
    textAlign: "center",
    boxShadow: "0 14px 40px rgba(255,47,104,0.10)",
  },

  countdownTitle: { fontWeight: 1000, fontSize: 16, marginBottom: 10 },

  countdownNumbers: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 10,
  },

  countBox: {
    background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(0,0,0,0.06)",
    borderRadius: 18,
    padding: "12px 8px",
  },

  countNum: { fontSize: 24, fontWeight: 1000 },
  countLabel: { opacity: 0.7, fontWeight: 800, fontSize: 12 },

  heroCard: {
    width: "100%",
    maxWidth: 1100,
    textAlign: "center",
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(255,47,104,0.12)",
    borderRadius: 26,
    padding: "28px 22px",
    boxShadow: "0 14px 40px rgba(255,47,104,0.12)",
    position: "relative",
  },

  title: {
    fontSize: "clamp(28px, 4vw, 48px)",
    margin: 0,
    lineHeight: 1.08,
    fontWeight: 1000,
  },

  name: {
    color: "#ff2f68",
    textShadow: "0 10px 30px rgba(255,47,104,0.25)",
  },

  subtitle: {
    marginTop: 10,
    marginBottom: 16,
    fontSize: "clamp(14px, 1.8vw, 18px)",
    opacity: 0.85,
    fontWeight: 650,
  },

  quoteBox: {
    width: "100%",
    maxWidth: 720,
    margin: "0 auto",
    display: "flex",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: "12px 14px",
    borderRadius: 18,
    background:
      "linear-gradient(90deg, rgba(255,47,104,0.10), rgba(153,102,255,0.08))",
    border: "1px solid rgba(255,47,104,0.16)",
    marginTop: 10,
    marginBottom: 18,
  },

  quoteIcon: { fontSize: 18 },
  quoteText: { fontWeight: 800 },

  buttons: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
  },

  primaryBtn: {
    border: "none",
    background: "linear-gradient(90deg, #ff2f68, #a855f7)",
    color: "white",
    padding: "12px 18px",
    borderRadius: 18,
    fontWeight: 1000,
    cursor: "pointer",
    boxShadow: "0 12px 26px rgba(255,47,104,0.22)",
  },

  secondaryBtn: {
    border: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(255,255,255,0.9)",
    padding: "12px 18px",
    borderRadius: 18,
    fontWeight: 900,
    cursor: "pointer",
  },

  noBtn: {
    border: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(255,255,255,0.95)",
    padding: "12px 18px",
    borderRadius: 18,
    fontWeight: 1000,
    cursor: "pointer",
    transition: "transform 0.15s ease",
  },

  tinyText: {
    marginTop: 10,
    fontWeight: 900,
    opacity: 0.75,
  },

  successBox: {
    marginTop: 18,
    padding: "14px 14px",
    borderRadius: 20,
    background: "rgba(255, 47, 104, 0.10)",
    border: "1px solid rgba(255,47,104,0.18)",
    textAlign: "center",
  },

  successTitle: { margin: 0, fontSize: 22, fontWeight: 1000 },
  successText: { margin: "6px 0 0 0", opacity: 0.85, fontWeight: 750 },

  grid: {
    width: "100%",
    maxWidth: 1100,
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16,
    justifyItems: "center",
  },

  card: {
    width: "100%",
    textAlign: "center",
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(0,0,0,0.06)",
    borderRadius: 24,
    padding: 18,
    boxShadow: "0 12px 28px rgba(0,0,0,0.06)",
  },

  cardTitle: { margin: 0, fontSize: 18, fontWeight: 1000 },
  cardText: { marginTop: 8, opacity: 0.8, fontWeight: 700 },

  list: {
    marginTop: 12,
    paddingLeft: 0,
    listStyle: "none",
    lineHeight: 1.75,
    opacity: 0.9,
    fontWeight: 750,
  },

  fileInput: {
    width: "100%",
    marginTop: 12,
    padding: 10,
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.9)",
    fontWeight: 800,
    cursor: "pointer",
  },

  slideshow: {
    marginTop: 12,
    borderRadius: 22,
    overflow: "hidden",
    border: "1px solid rgba(255,47,104,0.18)",
    background: "rgba(255,47,104,0.06)",
    minHeight: 220,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    padding: 10,
    userSelect: "none",
  },

  slideImg: {
    width: "100%",
    height: 220,
    objectFit: "cover",
    borderRadius: 18,
  },

  emptySlide: {
    padding: 16,
    fontWeight: 900,
    opacity: 0.75,
  },

  slideControls: {
    marginTop: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  slideBtn: {
    border: "1px solid rgba(0,0,0,0.10)",
    padding: "10px 14px",
    borderRadius: 16,
    cursor: "pointer",
    fontWeight: 1000,
    background: "rgba(255,255,255,0.9)",
  },

  slideCount: {
    fontWeight: 1000,
    opacity: 0.75,
  },

  letter: {
    marginTop: 10,
    padding: 14,
    borderRadius: 20,
    background:
      "linear-gradient(90deg, rgba(255,47,104,0.12), rgba(168,85,247,0.10))",
    border: "1px solid rgba(255, 47, 104, 0.18)",
    position: "relative",
  },

  letterPre: {
    margin: 0,
    whiteSpace: "pre-wrap",
    fontWeight: 800,
    lineHeight: 1.7,
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },

  cursorBlink: {
    position: "absolute",
    right: 14,
    bottom: 12,
    fontWeight: 1000,
    animation: "blink 1s infinite",
    opacity: 0.7,
  },

  mutedBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 20,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.7)",
    opacity: 0.85,
    fontWeight: 800,
  },

  footer: {
    textAlign: "center",
    padding: "18px 12px 28px",
    opacity: 0.75,
    fontWeight: 750,
  },

  heartsWrap: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    overflow: "hidden",
  },

  heart: {
    position: "absolute",
    bottom: "-20px",
    animation: "floatUp 6s linear infinite",
    filter: "blur(0.2px)",
  },

  burst: {
    position: "absolute",
    right: 18,
    top: 18,
    width: 1,
    height: 1,
    pointerEvents: "none",
  },

  burstHeart: {
    position: "absolute",
    animation: "pop 0.9s ease forwards",
    fontSize: 18,
  },

  cursorLayer: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 999,
  },

  cursorHeart: {
    position: "absolute",
    transform: "translate(-50%, -50%)",
    animation: "cursorPop 0.7s ease forwards",
    fontSize: 16,
    opacity: 0.9,
  },
};

/* Inject keyframes + confetti/fireworks CSS */
const styleTag = document.createElement("style");
styleTag.innerHTML = `
@keyframes floatUp {
  0% { transform: translateY(0) scale(1); opacity: 0; }
  10% { opacity: 0.8; }
  100% { transform: translateY(-110vh) scale(1.2); opacity: 0; }
}
@keyframes pop {
  0% { opacity: 0; transform: translate(0,0) scale(0.7); }
  35% { opacity: 1; transform: translate(var(--x,0), var(--y,0)) scale(1.2); }
  100% { opacity: 0; transform: translate(var(--x,0), var(--y,0)) scale(1.6); }
}
@keyframes cursorPop {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
  30% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
  100% { opacity: 0; transform: translate(-50%, -70%) scale(1.5); }
}
@keyframes blink {
  0%, 49% { opacity: 0.2; }
  50%, 100% { opacity: 0.9; }
}

/* Confetti */
.confetti {
  position: fixed;
  width: 10px;
  height: 14px;
  background: linear-gradient(90deg, #ff2f68, #a855f7);
  z-index: 9999;
  border-radius: 4px;
  animation: confettiFall linear forwards;
}
@keyframes confettiFall {
  to {
    transform: translateY(110vh) rotate(720deg);
    opacity: 0;
  }
}

/* Firework */
.firework {
  position: fixed;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff2f68;
  box-shadow:
    0 0 20px rgba(255,47,104,0.8),
    0 0 50px rgba(168,85,247,0.55);
  z-index: 9999;
  animation: fireworkBoom 1.4s ease-out forwards;
}
@keyframes fireworkBoom {
  0% { transform: scale(0.5); opacity: 0.3; }
  40% { transform: scale(1.6); opacity: 1; }
  100% { transform: scale(3.2); opacity: 0; }
}
`;
document.head.appendChild(styleTag);
