export default {
  title: 'Components/Button',
  tags: ['autodocs'],
  render: ({ label, variant, size }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.innerText = label;

    const baseClasses = 'font-semibold rounded-lg transition-all focus:outline-none focus:ring-2';
    const variantClasses = variant === 'primary' 
      ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
      : 'bg-slate-700 hover:bg-slate-600 text-slate-100 focus:ring-slate-400';
    const sizeClasses = size === 'small' ? 'px-3 py-1.5 text-sm' : 'px-5 py-2.5 text-base';

    btn.className = `${baseClasses} ${variantClasses} ${sizeClasses}`;
    return btn;
  },
  argTypes: {
    label: { control: 'text' },
    variant: { control: { type: 'select' }, options: ['primary', 'secondary'] },
    size: { control: { type: 'select' }, options: ['small', 'medium'] }
  }
};

export const Primary = {
  args: {
    label: 'Đặt Vé Ngay',
    variant: 'primary',
    size: 'medium'
  }
};

export const Secondary = {
  args: {
    label: 'Xem Chi Tiết',
    variant: 'secondary',
    size: 'medium'
  }
};
