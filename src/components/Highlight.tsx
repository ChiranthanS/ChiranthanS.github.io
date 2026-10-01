/** Renders "*marked*" segments of a string with the gradient highlight. */
export default function Highlight({ text, className = 'grad' }: { text: string; className?: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/g).map((part, i) =>
        part.startsWith('*') && part.endsWith('*') ? (
          <span key={i} className={className}>
            {part.slice(1, -1)}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}
