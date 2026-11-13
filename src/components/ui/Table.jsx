
import './Table.css';

export function Table({
  columns = [],
  rows = [],
  rowKey = 'id',
  selectedKey,
  emptyText = '',
  onRowClick,
  className = '',
  ...rest
}) {
  const isClickable = typeof onRowClick === 'function';

  function handleRowKeyDown(event, row) {
    if (!isClickable) return;

    if (
      event.key === 'Enter' &&
      event.target === event.currentTarget
    ) {
      event.preventDefault();
      onRowClick(row);
    }
  }

  function getRowKey(row, index) {
    if (typeof rowKey === 'function') {
      return rowKey(row);
    }

    return row?.[rowKey] ?? index;
  }

  function getAlignment(align) {
    if (align === 'center' || align === 'right') {
      return align;
    }

    return 'left';
  }

  return (
    <div
      {...rest}
      className={`wq-table-wrap ${className}`.trim()}
    >
      <table className="wq-table">
        <thead>
          <tr>
            {columns.map((column, index) => {
              const align = getAlignment(column.align);

              return (
                <th
                  key={column.key ?? index}
                  scope="col"
                  className={[
                    'wq-table-head',
                    `wq-table-align-${align}`,
                    column.hideOnSmall ? 'wq-hide-sm' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {column.header}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr className="wq-table-empty-row">
              <td
                className="wq-table-empty"
                colSpan={Math.max(columns.length, 1)}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => {
              const key = getRowKey(row, index);

              const isSelected =
                selectedKey != null &&
                key === selectedKey;

              return (
                <tr
                  key={key}
                  className={[
                    'wq-table-row',
                    isClickable
                      ? 'wq-table-row--clickable'
                      : '',
                    isSelected
                      ? 'wq-table__row--selected'
                      : '',
                  ].filter(Boolean).join(' ')}
                  tabIndex={isClickable ? 0 : undefined}
                  aria-selected={
                    isSelected ? true : undefined
                  }
                  onClick={
                    isClickable
                      ? () => onRowClick(row)
                      : undefined
                  }
                  onKeyDown={
                    isClickable
                      ? (event) => handleRowKeyDown(event, row)
                      : undefined
                  }
                >
                  {columns.map((column, columnIndex) => {
                    const align = getAlignment(column.align);

                    const content =
                      typeof column.render === 'function'
                        ? column.render(row)
                        : row?.[column.key];

                    return (
                      <td
                        key={column.key ?? columnIndex}
                        className={[
                          'wq-table-cell',
                          `wq-table-align-${align}`,
                          column.hideOnSmall
                            ? 'wq-hide-sm'
                            : '',
                        ].filter(Boolean).join(' ')}
                      >
                        {content ?? ''}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
