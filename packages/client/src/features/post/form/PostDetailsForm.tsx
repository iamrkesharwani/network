import { useState } from 'react';
import { Loader2, Rocket } from 'lucide-react';
import {
  POST_TEXT_MAX_LENGTH,
  type ICreatorEvent,
  type IPostResponse,
  type PostVisibility,
} from '@network/shared';
import { useFinalisePostMutation } from '../postApi';
import { extractErrorMessage } from '../../upload/hooks/useMediaEditForm';
import FloatingTextarea from '../../upload/components/FloatingTextarea';
import TagInput from '../../upload/components/TagInput';
import VisibilitySelector from '../../upload/components/VisibilitySelector';

interface PostDetailsFormProps {
  postId: string;
  onSuccess: (
    post: IPostResponse,
    creatorEvent?: ICreatorEvent | null
  ) => void;
}

const PostDetailsForm = ({ postId, onSuccess }: PostDetailsFormProps) => {
  const [finalisePost, { isLoading }] = useFinalisePostMutation();
  const [text, setText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<PostVisibility>('public');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    try {
      const result = await finalisePost({
        postId,
        ...(text.trim() && { text: text.trim() }),
        tags,
        visibility,
      }).unwrap();
      onSuccess(result.data.post, result.data.creatorEvent);
    } catch (err) {
      setSubmitError(extractErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
      <FloatingTextarea
        label="What's on your mind?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={POST_TEXT_MAX_LENGTH}
        counter={{ current: text.length, max: POST_TEXT_MAX_LENGTH }}
        rows={4}
        disabled={isLoading}
      />

      <TagInput value={tags} onChange={setTags} />

      <VisibilitySelector value={visibility} onChange={setVisibility} />

      {submitError && (
        <p className="mb-3 text-sm text-red-500" role="alert">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="submit-btn relative w-full overflow-hidden rounded-lg border border-primary py-3 text-sm font-semibold text-primary disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Rocket className="w-4 h-4" />
        )}
        Post
      </button>
    </form>
  );
};

export default PostDetailsForm;
