// Phase 0 unstyled placeholder. Owner: Dev 3.
import './Table.css';
export function Table({ columns = [], rows = [], rowKey = 'id', emptyText = 'No data', onRowClick, className = '', ...rest }) {
  return <table {...rest} className={`wq-table ${className}`}><thead><tr>{columns.map(col => <th key={col.key} className={col.hideOnSmall ? 'wq-hide-sm' : undefined}>{col.header}</th>)}</tr></thead>
    <tbody>{rows.length ? rows.map(row => <tr key={row[rowKey]} onClick={() => onRowClick?.(row)}>
      {columns.map(col => <td key={col.key} className={`${col.hideOnSmall ? 'wq-hide-sm ' : ''}wq-table-align--${col.align || 'left'}`}>{col.render ? col.render(row) : row[col.key]}</td>)}
    </tr>) : <tr><td colSpan={Math.max(1, columns.length)}>{emptyText}</td></tr>}</tbody>
  </table>;
}
