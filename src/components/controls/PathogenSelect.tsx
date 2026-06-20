import {useState, useEffect} from 'react';
import {Autocomplete, TextField, CircularProgress} from '@mui/material';

const PATHOGENS_URL = '/rest/pathogens/?limit=1000';

export type Pathogen = {
    name: string;
    display_name: string;
};

type PathogenFieldProps = {
    value: Pathogen | null;
    onChange: (pathogen: Pathogen | null) => void;
  };

export function PathogenSelect({value, onChange}: PathogenFieldProps) {
    const [options, setOptions] = useState<Pathogen[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let active = true;
        setLoading(true);
        fetch(PATHOGENS_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Request failed: ${response.status}`);
                }
                return response.json();
            })
            .then((data: {results?: Pathogen[]} | Pathogen[]) => {
                const results = Array.isArray(data) ? data : data.results ?? [];
                if (active) setOptions(results);
            })
            .catch((error) => {
                console.log('Error fetching pathogens:', error);
                if (active) setOptions([]);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    return (
        <Autocomplete
            options={options}
            loading={loading}
            value={value ?? null}
            onChange={(_event, newValue) => onChange(newValue as Pathogen)}
            getOptionLabel={(option) => option.display_name}
            isOptionEqualToValue={(option, value) => option.name === value?.name}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Pathogen"
                    slotProps={{
                        ...params.slotProps,
                        input: {
                            ...params.slotProps.input,
                            endAdornment: (
                                <>
                                    {loading ? <CircularProgress size={18} /> : null}
                                    {params.slotProps.input.endAdornment}
                                </>
                            ),
                        },
                    }}
                />
            )}
        />
    );
}
