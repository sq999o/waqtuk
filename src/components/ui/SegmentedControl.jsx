import './SegmentedControl.css';

export function SegmentedControl({
  options = [],
  value,
  onChange,
  className = '',
  variant = 'soft',
  ...rest
}) {
  const controlVariant = variant === 'solid' ? 'solid' : 'soft';

  function handleKeyDown(event, currentIndex) {
    let nextIndex;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % options.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + options.length) % options.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = options.length - 1;
    } else {
      return;
    }

    event.preventDefault();

    const buttons = event.currentTarget.parentElement?.querySelectorAll(
      '.wq-segmented-control__button'
    );

    buttons?.[nextIndex]?.focus();
    onChange?.(options[nextIndex].value);
  }

  return (
    <div
      {...rest}
      className={[
        'wq-segmented-control',
        `wq-segmented-control--${controlVariant}`,
        className,
      ].filter(Boolean).join(' ')}
      role="group"
    >
      {options.map((option, index) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            className={[
              'wq-segmented-control__button',
              selected ? 'wq-segmented-control__button--selected' : '',
            ].filter(Boolean).join(' ')}
            aria-pressed={selected}
            onClick={() => onChange?.(option.value)}
            onKeyDown={event => handleKeyDown(event, index)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
