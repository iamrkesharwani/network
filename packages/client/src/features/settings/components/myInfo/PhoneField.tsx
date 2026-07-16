import { useState } from 'react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { COUNTRIES, type BasicProfileInput } from '@network/shared';
import { maskPhoneNumber } from '@network/shared';
import Select from '../../../../shared/ui/primitives/Select';
import MaskedFieldRow from './MaskedFieldRow';

const countryOptions = COUNTRIES.map((country) => ({
  value: country.iso2,
  label: `${country.flagEmoji} ${country.dialCode} ${country.name}`,
}));

const findCountryByDialCode = (dialCode: string | undefined) =>
  COUNTRIES.find((country) => country.dialCode === dialCode) ?? COUNTRIES[0];

interface PhoneFieldProps {
  control: Control<BasicProfileInput>;
  errors: FieldErrors<BasicProfileInput>;
  hasExistingPhone: boolean;
}

const PhoneField = ({ control, errors, hasExistingPhone }: PhoneFieldProps) => {
  const [isEditing, setIsEditing] = useState(!hasExistingPhone);

  return (
    <Controller
      control={control}
      name="phone"
      render={({ field }) => {
        const dialCode = field.value?.dialCode ?? countryOptions[0]?.value;
        const number = field.value?.number ?? '';
        const maskedValue = number
          ? `${findCountryByDialCode(dialCode).dialCode} ${maskPhoneNumber(number)}`
          : 'Not added';

        return (
          <MaskedFieldRow
            label="Phone"
            maskedValue={maskedValue}
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
          >
            <div className="mb-6 flex items-start gap-2">
              <Select
                containerClassName="mb-0 w-40 shrink-0"
                value={findCountryByDialCode(dialCode).iso2}
                onChange={(iso2) => {
                  const country = COUNTRIES.find((c) => c.iso2 === iso2);
                  if (country) {
                    field.onChange({ ...field.value, dialCode: country.dialCode, number });
                  }
                }}
                options={countryOptions}
              />
              <div className="flex-1">
                <input
                  type="tel"
                  value={number}
                  onChange={(event) =>
                    field.onChange({
                      dialCode: findCountryByDialCode(dialCode).dialCode,
                      number: event.target.value.replace(/\D/g, ''),
                    })
                  }
                  placeholder="Phone number"
                  className="field-input w-full border-0 border-b border-white/9 bg-transparent px-[0.1rem] py-[0.55rem] pb-[0.65rem] text-base font-medium text-text-primary outline-none transition-colors duration-300"
                />
                {errors.phone?.number?.message && (
                  <p role="alert" className="mt-1.5 text-[0.72rem] text-error">
                    {errors.phone.number.message}
                  </p>
                )}
              </div>
            </div>
          </MaskedFieldRow>
        );
      }}
    />
  );
};

export default PhoneField;
