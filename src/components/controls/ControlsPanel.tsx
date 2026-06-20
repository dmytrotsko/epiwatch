import { useState } from 'react';
import { Button, Stack, Paper, Typography, Divider } from '@mui/material';
import { LocationField, type County } from './LocationField';
import { PathogenSelect, type Pathogen } from './PathogenSelect';


type Indicator = {
    id: number;
    name: string;
    display_name: string;
    description: string;
};

export function ControlsPanel() {

    const [selectedLocation, setSelectedLocation] = useState<County | null>(null);
    const [selectedPathogen, setSelectedPathogen] = useState<Pathogen | null>(null);
    const [indicators, setIndicators] = useState<Indicator[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit() {
        if (!selectedLocation || !selectedPathogen) return;

        const params = new URLSearchParams({
            geo_type: 'county',
            geo_value: selectedLocation.fips.toLowerCase(),
            pathogen: selectedPathogen.name,
        });

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/available-indicators/?${params}`
            );
            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }
            const data: { indicators?: Indicator[] } = await response.json();
            setIndicators(data.indicators ?? []);
        } catch (err) {
            console.log('Error fetching available indicators:', err);
            setError('Failed to load indicators.');
            setIndicators([]);
        } finally {
            setLoading(false);
        }
    }

    const canSubmit = selectedLocation && selectedPathogen;

    return (
        <Paper sx={{ p: 2 }}>
            <Stack spacing={2}>
                <LocationField value={selectedLocation} onChange={setSelectedLocation} />
                <PathogenSelect value={selectedPathogen} onChange={setSelectedPathogen} />
                <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit || loading}>
                    {loading ? 'Loading…' : 'Submit'}
                </Button>

                {error && (
                    <Typography color="error" variant="body2">
                        {error}
                    </Typography>
                )}

                {indicators.length > 0 && (
                    <Stack spacing={1} divider={<Divider flexItem />}>
                        {indicators.map((indicator) => (
                            <Stack key={indicator.id} spacing={0.5}>
                                <Typography variant="subtitle1">
                                    {indicator.display_name || indicator.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {indicator.description}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
}