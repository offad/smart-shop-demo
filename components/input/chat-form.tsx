'use client'

import { type AI } from '@/lib/services/ai-state'

import { ReactNode, useEffect, useRef, useTransition } from 'react'
import { useActions, useAIState, useUIState } from 'ai/rsc'

import { SpinnerMessage, UserMessage } from '../chat/message'

import { nanoid } from '@/lib/utils/nanoid'
import { useRouter } from 'next/navigation'

import { toast } from 'sonner'
import { getMessageFromCode } from '@/lib/utils/result'

import { useDebouncedCallback } from 'use-debounce';
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'

import Textarea from 'react-textarea-autosize'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { PlusIcon, ArrowTurnDownLeftIcon } from '@heroicons/react/24/outline';

export function PromptForm({
	input,
	setInput
}: {
	input: string
	setInput: (value: string) => void
}) {

	const router = useRouter()
	const { formRef, onKeyDown } = useEnterSubmit()
	const inputRef = useRef<HTMLTextAreaElement>(null)
	const { submitUserMessage } = useActions()

	const [isPending, startTransition] = useTransition();

	// https://sdk.vercel.ai/docs/reference/ai-sdk-rsc/use-ui-state
	const [_, setMessages] = useUIState<typeof AI>()
	const [aiState] = useAIState()


	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus()
		}
	}, [])

	const callback = async (value: string) => {
		// Split words by white space or comma
		const words = value.split(/[,]+/)
		for (const word of words) {
			
			// Optimistically add user message UI
			setMessages(currentMessages => [
				...currentMessages,
				{
					id: nanoid(),
					display: <UserMessage>{word}</UserMessage>
				},
				{
					id: nanoid(),
					display: <SpinnerMessage />
				}
			])

		}

		// Submit user message
		const response = await submitUserMessage(value)
		if (response.type === 'error') {
			toast.error(getMessageFromCode(response.resultCode))
		} else {
			
			// Update UI with placeholder interface
			const responses = response.responses
			setMessages(currentMessages => {

				const messagesLength = currentMessages.length - 1
				const responsesLength = responses.length

				responses.forEach(function (message: {
					id: string,
					display: ReactNode
				}, index: number) {
					// Place recommendation every other message
					let displacement = (responsesLength - (index + 1)) * 2

					// Insert at a position from the end
					let currentIndex = messagesLength - displacement;
					currentMessages[currentIndex] = message
				});

				return currentMessages
			})

			// Wait for AI response to finish
			const responsesPromise = response.promise
			responsesPromise.then((response: any) => {
				// New chat?
				if (response) {

					startTransition(() => {
						// Move to the new chat
						let id = aiState.chatId
						let path = `list/${id}`
						window.history.replaceState({}, '', path)

						// Rebuild
						router.refresh()

						// Refresh the page
						location.reload();
					})
					
				}

			});

		}

	}

	const debouncedSubmitHandler = useDebouncedCallback(callback, 2000)

	const onSubmit = (e: any) => {

		e.preventDefault()

		// Blur focus on mobile
		if (window.innerWidth < 600) {
			e.target['message']?.blur()
		}

		const value = input.trim()
		setInput('')
		if (!value) return

		debouncedSubmitHandler(value)
		
	}

	return (
		<form
			ref={formRef}
			onSubmit={onSubmit}
		>
			<div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="absolute left-0 top-[14px] size-8 rounded-full bg-background p-0 sm:left-4"
							onClick={() => {
								router.push('/new')
							}}
						>
							<PlusIcon />
							<span className="sr-only">New Chat</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>New Chat</TooltipContent>
				</Tooltip>
				<Textarea
					ref={inputRef}
					tabIndex={0}
					onKeyDown={onKeyDown}
					placeholder="Send a message."
					className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
					autoFocus
					spellCheck={false}
					autoComplete="off"
					autoCorrect="off"
					name="message"
					rows={1}
					value={input}
					onChange={e => setInput(e.target.value)}
				/>
				<div className="absolute right-0 top-[13px] sm:right-4">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button type="submit" size="icon" disabled={input === ''}>
								<ArrowTurnDownLeftIcon />
								<span className="sr-only">
									Send message
								</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							Send message
						</TooltipContent>
					</Tooltip>
				</div>
			</div>
		</form>
	)
}