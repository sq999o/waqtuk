
import './Table.css';

export function Table({
  columns = [],
  rows = [],
  rowKey = 'id',
  emptyText = 'No data',
  onRowClick,
  className = '',
  ...rest
}) {
  const getAlignment = align =>
    ['left', 'center', 'right'].includes(align) ? align : 'left';

  const getColumnClassName = column => [
    column.hideOnSmall ? 'wq-hide-sm' : '',
    `wq-table-align--${getAlignment(column.align)}`,
  ].filter(Boolean).join(' ');

  const tableClassName = [
    'wq-table',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      {...rest}
      className={`wq-table-wrap ${className}`.trim()}
    >
      <table className={tableClassName}>
        <thead>
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                scope="col"
                className={getColumnClassName(column)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <tr
                key={row?.[rowKey] ?? index}
                className={onRowClick ? 'wq-table__row--clickable' : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? event => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                tabIndex={onRowClick ? 0 : undefined}
              >
                {columns.map(column => (
                  <td
                    key={column.key}
                    className={getColumnClassName(column)}
                  >
                    {typeof column.render === 'function'
                      ? column.render(row)
                      : row?.[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr className="wq-table__empty-row">
              <td colSpan={Math.max(1, columns.length)}>
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
