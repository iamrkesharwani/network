import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import {
  POST_TEXT_MAX_LENGTH,
  type IPostResponse,
  type PostVisibility,
} from '@network/shared';
import { useUpdatePostMutation } from '../postApi';
import { extractErrorMessage } from '../../upload/hooks/useMediaEditForm';
import FloatingTextarea from '../../upload/components/FloatingTextarea';
import TagInput from '../../upload/components/TagInput';
import VisibilitySelector from '../../upload/components/VisibilitySelector';

interface PostEditFormProps {
  postId: string;
  initialValues: {
    text?: string;
    tags: string[];
    visibility: PostVisibility;
  };
  onSuccess: (post: IPostResponse) => void;
}

const PostEditForm = ({
  postId,
  initialValues,
  onSuccess,
}: PostEditFormProps) => {
  const [updatePost, { isLoading }] = useUpdatePostMutation();
  const [text, setText] = useState(initialValues.text ?? '');
  const [tags, setTags] = useState<string[]>(initialValues.tags);
  const [visibility, setVisibility] = useState<PostVisibility>(
    initialValues.visibility
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    try {
      const result = await updatePost({
        postId,
        text: text.trim(),
        tags,
        visibility,
      }).unwrap();
      onSuccess(result.data);
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
          <Save className="w-4 h-4" />
        )}
        Save changes
      </button>
    </form>
  );
};

export default PostEditForm;
