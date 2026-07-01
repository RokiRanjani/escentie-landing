/* Escentie Tweaks — expressive controls that reshape the whole-page feel.
   Drives the vanilla page via body data-attributes, CSS vars, and the parallax global. */
const ESC_DEFAULTS = /*EDITMODE-BEGIN*/{
  "mood": "golden",
  "motion": "lively",
  "haze": 0.25
}/*EDITMODE-END*/;

const MOTION_INTENSITY = { calm: 0.10, lively: 0.18, cinematic: 0.27 };

function EscentieTweaks() {
  const [t, setTweak] = useTweaks(ESC_DEFAULTS);

  React.useEffect(() => {
    document.body.setAttribute("data-mood", t.mood);
  }, [t.mood]);

  React.useEffect(() => {
    document.body.setAttribute("data-motion", t.motion);
    if (window.__escentie) window.__escentie.setIntensity(MOTION_INTENSITY[t.motion] ?? 0.18);
  }, [t.motion]);

  React.useEffect(() => {
    document.documentElement.style.setProperty("--haze", String(t.haze));
  }, [t.haze]);

  return (
    <TweaksPanel>
      <TweakSection label="Suasana">
        <p className="twk-note">Pencahayaan & rona seluruh halaman — dari hangat keemasan hingga senja larut.</p>
      </TweakSection>
      <TweakRadio
        label="Mood"
        value={t.mood}
        options={[
          { value: "golden", label: "Golden Hour" },
          { value: "garden", label: "Kebun Teh" },
          { value: "midnight", label: "Tengah Malam" },
        ]}
        onChange={(v) => setTweak("mood", v)}
      />

      <TweakSection label="Karakter Gerak">
        <p className="twk-note">Kepribadian gerak: kecepatan parallax, jarak & durasi animasi teks, ayunan logo.</p>
      </TweakSection>
      <TweakRadio
        label="Gerak"
        value={t.motion}
        options={[
          { value: "calm", label: "Tenang" },
          { value: "lively", label: "Hidup" },
          { value: "cinematic", label: "Sinematik" },
        ]}
        onChange={(v) => setTweak("motion", v)}
      />

      <TweakSection label="Kabut Aroma">
        <p className="twk-note">Selubung kabut lembut yang membuat udara terasa lebih berembun & sinematik.</p>
      </TweakSection>
      <TweakSlider label="Ketebalan kabut" value={t.haze} min={0} max={0.8} step={0.05}
        onChange={(v) => setTweak("haze", v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<EscentieTweaks />);
