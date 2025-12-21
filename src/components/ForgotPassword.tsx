import { useState } from 'react';
import type { FormEvent } from 'react';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import apiClient from '../lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog';

interface ForgotPasswordProps {
	onSent?: (email: string) => void;
	triggerClassName?: string;
}

type RecoveryMode = 'password' | 'restaurantId';

export function ForgotPassword({ onSent, triggerClassName }: ForgotPasswordProps) {
	const [open, setOpen] = useState(false);
	const [email, setEmail] = useState('');
	const [restaurantId, setRestaurantId] = useState('');
	const [selectedMode, setSelectedMode] = useState<RecoveryMode | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const resetState = () => {
		setEmail('');
		setRestaurantId('');
		setSelectedMode(null);
		setIsSubmitting(false);
		setMessage(null);
		setError(null);
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!selectedMode) {
			setError('Please choose what you need help with first.');
			return;
		}
		const trimmedEmail = email.trim();
		const trimmedRestaurantId = restaurantId.trim();

		if (!trimmedEmail || !trimmedEmail.includes('@')) {
			const validationMessage = 'Please enter a valid email address to continue.';
			setError(validationMessage);
			toast.error(validationMessage);
			return;
		}

		if (selectedMode === 'password' && !trimmedRestaurantId) {
			const validationMessage = 'Please enter your Restaurant ID to continue.';
			setError(validationMessage);
			toast.error(validationMessage);
			return;
		}

		setIsSubmitting(true);
		setError(null);

		const endpoints: Record<RecoveryMode, string> = {
			password: '/auth/forgot-password',
			restaurantId: '/auth/forgot-restaurant-id',
		};

		const successCopy: Record<RecoveryMode, string> = {
			password: 'If this email is registered, a reset link will arrive shortly.',
			restaurantId:
				'If this email is registered, we will send your Restaurant ID to your inbox.',
		};

		try {
			await apiClient.post(endpoints[selectedMode], {
				email: trimmedEmail,
				...(selectedMode === 'password' ? { restaurantId: trimmedRestaurantId } : {}),
			});
			const successMessage = successCopy[selectedMode];
			setMessage(successMessage);
			toast.success(successMessage);
			onSent?.(trimmedEmail);
		} catch (err) {
			const axiosError = err as AxiosError<{ message?: string }>;
			const failureMessage =
				axiosError.response?.data?.message ||
				'Failed to send the email. Please try again in a moment.';
			setError(failureMessage);
			toast.error(failureMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen: boolean) => {
				setOpen(nextOpen);
				if (!nextOpen) {
					resetState();
				}
			}}
		>
			<DialogTrigger asChild>
				<Button
					variant="link"
					className={triggerClassName || 'text-sm px-0 text-primary'}
				>
					Need help signing in?
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[calc(100vw-3rem)] sm:max-w-md md:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{selectedMode === 'restaurantId'
							? 'Retrieve your Restaurant ID'
							: selectedMode === 'password'
								? 'Reset your password'
								: 'What do you need help with?'}
					</DialogTitle>
					<DialogDescription>
						{selectedMode === 'restaurantId'
							? 'Enter your email and we will email your Restaurant ID if it is registered.'
							: selectedMode === 'password'
								? 'Enter your email and we will send a secure link to reset your password.'
								: 'Choose whether you want to reset your password or retrieve your Restaurant ID.'}
					</DialogDescription>
				</DialogHeader>

				{!selectedMode ? (
					<div className="grid gap-3 pt-2">
						<Button
							variant="outline"
							className="justify-between"
							onClick={() => setSelectedMode('password')}
						>
							<span className="font-medium">Reset password</span>
							<span className="text-sm text-muted-foreground">Get a secure reset link</span>
						</Button>
						<Button
							variant="outline"
							className="justify-between"
							onClick={() => setSelectedMode('restaurantId')}
						>
							<span className="font-medium">Forgot Restaurant ID</span>
							<span className="text-sm text-muted-foreground">Email me my Restaurant ID</span>
						</Button>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-4">
						{selectedMode === 'password' && (
							<div className="space-y-2">
								<Label htmlFor="forgot-recovery-restaurant-id">Restaurant ID</Label>
								<Input
									id="forgot-recovery-restaurant-id"
									placeholder="Enter your Restaurant ID"
									value={restaurantId}
									onChange={(event) => {
										setRestaurantId(event.target.value);
										if (error) {
											setError(null);
										}
									}}
									required
								/>
								<p className="text-xs text-muted-foreground">
									This helps us verify your account before sending the reset link.
								</p>
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="forgot-recovery-email">Email address</Label>
							<Input
								id="forgot-recovery-email"
								type="email"
								placeholder="you@example.com"
								value={email}
								onChange={(event) => {
									setEmail(event.target.value);
									if (error) {
										setError(null);
									}
								}}
								autoComplete="email"
								required
							/>
							<p className="text-xs text-muted-foreground">
								{selectedMode === 'restaurantId'
									? 'We will email your Restaurant ID to this address if it is registered.'
									: 'We will send the reset link to this email if it is registered.'}
							</p>
						</div>

						{message && <p className="text-sm text-green-600">{message}</p>}
						{error && <p className="text-sm text-destructive">{error}</p>}

						<div className="flex justify-between gap-2 pt-2">
							<Button
								variant="ghost"
								type="button"
								onClick={() => {
									setMessage(null);
									setError(null);
									setSelectedMode(null);
								}}
							>
								Back
							</Button>
							<div className="flex gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setOpen(false);
										resetState();
									}}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting
										? 'Sending...'
										: selectedMode === 'restaurantId'
											? 'Send Restaurant ID'
											: 'Send reset link'}
								</Button>
							</div>
						</div>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
