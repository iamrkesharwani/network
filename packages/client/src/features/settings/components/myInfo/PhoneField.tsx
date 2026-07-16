import { useState } from 'react';
import { Phone } from 'lucide-react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { COUNTRIES, maskPhoneNumber, type BasicProfileInput } from '@network/shared';
import CountrySelect from './CountrySelect';
import MaskedFieldRow from './MaskedFieldRow';

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
        const dialCode = field.value?.dialCode ?? COUNTRIES[0]?.dialCode;
        const number = field.value?.number ?? '';
        const maskedValue = number
          ? `${findCountryByDialCode(dialCode).dialCode} ${maskPhoneNumber(number)}`
          : 'Not added';

        return (
          <MaskedFieldRow
            label="Phone"
            icon={Phone}
            maskedValue={maskedValue}
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
          >
            <div className="mb-6">
              <p className="mb-2.5 flex items-center gap-1.5 text-sm font-medium text-text-secondary">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                Phone
              </p>
              <div className="flex items-start gap-2">
                <CountrySelect
                  containerClassName="w-32 shrink-0"
                  value={findCountryByDialCode(dialCode).iso2}
                  onChange={(iso2) => {
                    const country = COUNTRIES.find((c) => c.iso2 === iso2);
                    if (country) {
                      field.onChange({ ...field.value, dialCode: country.dialCode, number });
                    }
                  }}
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
                    className="w-full rounded-lg border border-border bg-surface-raised px-3.5 py-2.5 text-sm font-medium text-text-primary outline-none transition-colors focus:border-primary"
                  />
                  {errors.phone?.number?.message && (
                    <p role="alert" className="mt-1.5 text-[0.72rem] text-error">
                      {errors.phone.number.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </MaskedFieldRow>
        );
      }}
    />
  );
};

export default PhoneField;
