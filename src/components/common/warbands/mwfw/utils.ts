export function selectedOptionWithName(optionName: string) {
  return (opt) => opt.name === optionName && opt.quantity > 0;
}
