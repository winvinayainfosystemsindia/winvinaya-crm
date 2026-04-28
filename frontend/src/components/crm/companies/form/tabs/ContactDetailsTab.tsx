import React from 'react';
import { Grid, TextField } from '@mui/material';
import type { Company } from '../../../../../models/company';

interface ContactDetailsTabProps {
	formData: Partial<Company>;
	onChange: (field: string, value: unknown) => void;
}

const ContactDetailsTab: React.FC<ContactDetailsTabProps> = ({ formData, onChange }) => {
	const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: 1 } };

	return (
		<Grid container spacing={3}>
			{/* Work Email */}
			<Grid size={{ xs: 12, md: 6 }}>
				<TextField
					fullWidth
					label="Work Email"
					type="email"
					value={formData.email ?? ''}
					onChange={(e) => onChange('email', e.target.value)}
					size="small"
					sx={inputSx}
				/>
			</Grid>

			{/* Phone Number */}
			<Grid size={{ xs: 12, md: 6 }}>
				<TextField
					fullWidth
					label="Phone Number"
					value={formData.phone ?? ''}
					onChange={(e) => onChange('phone', e.target.value)}
					size="small"
					sx={inputSx}
				/>
			</Grid>

			{/* Website */}
			<Grid size={{ xs: 12 }}>
				<TextField
					fullWidth
					label="Website"
					value={formData.website ?? ''}
					placeholder="https://example.com"
					onChange={(e) => onChange('website', e.target.value)}
					size="small"
					sx={inputSx}
				/>
			</Grid>
		</Grid>
	);
};

export default ContactDetailsTab;
