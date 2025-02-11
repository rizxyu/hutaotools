msg="Update from up.sh"
if [[ "$@" ]]; then
    msg="$@"
fi

currentBranch=$(git branch --no-color --show-current)

git pull &&
git add . &&
git commit -m "$msg" &&
git branch -M ${currentBranch} &&
git push -u origin ${currentBranch} --force

unset msg
unset currentBranch
