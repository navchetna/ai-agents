export function DoodleBackground() {
  return (
    <div className="fixed inset-0 z-0 grid place-items-center overflow-hidden">
      <div
        className="w-full h-full opacity-15"
        style={{
          backgroundImage:
            'url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-xY0Ucgjp9t4TzhwbdNOJabAub3YQCE.png")',
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundColor: "transparent",
        }}
      />
    </div>
  )
}

