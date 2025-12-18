import { transactionCategoryStyles } from "@/constants";
import { cn, formatAmount, formatDateTime, getTransactionStatus, removeSpecialCharacters } from "@/lib/utils";

const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  const {
    borderColor,
    backgroundColor,
    textColor,
    chipBackgroundColor,
  } = transactionCategoryStyles[category as keyof typeof transactionCategoryStyles] || transactionCategoryStyles.default;

  return (
    <div className={cn('category-badge flex items-center gap-2 px-2 py-1 rounded border', borderColor, chipBackgroundColor)}>
      <div className={cn('w-3 h-3 rounded-full', backgroundColor)} />
      <p className={cn('text-xs font-medium', textColor)}>{category}</p>
    </div>
  );
};

const TransactionsTable = ({ transactions }: TransactionTableProps) => {
  return (
    <table className="w-full border-collapse">
      <thead className="bg-[#f9fafb]">
        <tr>
          <th className="px-2 text-left">Transaction</th>
          <th className="px-2 text-left">Amount</th>
          <th className="px-2 text-left">Status</th>
          <th className="px-2 text-left">Date</th>
          <th className="px-2 text-left max-md:hidden">Channel</th>
          <th className="px-2 text-left max-md:hidden">Category</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t: Transaction) => {
          const status = getTransactionStatus(new Date(t.date));
          const amount = formatAmount(t.amount);

          const isDebit = t.type === 'debit';
          const isCredit = t.type === 'credit';

          return (
            <tr
              key={t.id}
              className={cn(
                (isDebit || amount[0] === '-') ? 'bg-[#FFFBFA]' : 'bg-[#F6FEF9]',
                'border-b border-gray-200 hover:bg-gray-100'
              )}
            >
              <td className="max-w-[250px] pl-2 pr-10 truncate">
                <div className="flex items-center gap-3">
                  <h1 className="text-sm font-semibold text-[#344054] truncate">
                    {removeSpecialCharacters(t.name)}
                  </h1>
                </div>
              </td>

              <td className={cn("pl-2 pr-10 font-semibold", {
                'text-[#f04438]': isDebit || amount[0] === '-',
                'text-[#039855]': !isDebit,
              })}>
                {isDebit ? `-${amount}` : amount}
              </td>

              <td className="pl-2 pr-10">
                <CategoryBadge category={status} />
              </td>

              <td className="min-w-32 pl-2 pr-10">
                {formatDateTime(new Date(t.date)).dateTime}
              </td>

              <td className="pl-2 pr-10 capitalize min-w-24 max-md:hidden">
                {t.paymentChannel}
              </td>

              <td className="pl-2 pr-10 max-md:hidden">
                {t.category}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default TransactionsTable;
