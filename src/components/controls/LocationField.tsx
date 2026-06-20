import { useState, useEffect } from 'react';
import {
    Autocomplete,
    TextField,
    IconButton,
    InputAdornment,
    CircularProgress
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import COUNTIES from '../../data/counties.json';
import ZIP_TO_FIPS from '../../data/zip2fips.json';


export type County = {
    fips: string;
    name: string;
    state: string;
};

const ZIP_PATTERN = /^\d{5}$/;

async function coordsToCounty(lat: number, lng: number): Promise<County | null> {
    const url = `https://geo.fcc.gov/api/census/area?lat=${lat}&lon=${lng}&format=json`;
    const response = await fetch(url);
    const data = await response.json();
    const result = data.results[0];
    if (!result || !result.county_fips) {
        console.log('No county found for coordinates:', lat, lng);
        return null;
    }
    return {
        fips: result.county_fips,
        name: `${result.county_name} County`,
        state: result.state_code
    };
}

function lookupZip(zip: string): County | null {
    const fips = ZIP_TO_FIPS[zip];
    if (!fips) {
        console.log('No FIPS found for ZIP:', zip);
        return null;
    }
    return COUNTIES.find(c => c.fips === fips) ?? null;
}

type LocationFieldProps = {
    value: County | null;
    onChange: (location: County | null) => void;
  };

export function LocationField({value, onChange}: LocationFieldProps) {
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');

    function handleUserLocation() {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const found = await coordsToCounty(
                    position.coords.latitude,
                    position.coords.longitude
                );
                if (found) {
                    const match = (COUNTIES as County[]).find(c => c.fips === found.fips) ?? found;
                    onChange(match);
                }
                setLoading(false);
            },
            (error) => {
                console.log('Error getting user location:', error);
                setLoading(false);
            }
        )
    }

    function handleInputChange(event: unknown, newText: string) {
        setInputValue(newText);
        const trimmed = newText.trim();
        if (ZIP_PATTERN.test(trimmed)) {
            const found = lookupZip(trimmed);
            if (found) onChange(found);
        }
    }

    return (
        <Autocomplete
            options={COUNTIES as County[]}
            value={value}
            onChange={(event, newValue) => onChange(newValue)}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            getOptionLabel={(option) => `${option.name}, ${option.state}`}
            isOptionEqualToValue={(option, value) => option.fips === value?.fips}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Location"
                    slotProps={{
                        ...params.slotProps,
                        input: {
                            ...params.slotProps.input,
                            endAdornment: (
                                <>
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={handleUserLocation}>
                                            {loading ? (
                                                <CircularProgress size={18} />
                                            ) : (
                                                <MyLocationIcon fontSize="small" />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
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