git clone "https://github.com/Dashium/Dashium" dist
cd dist

# bail if nothing changed
if [ "$(git status --porcelain)" = "" ]; then
  echo "no new content found; goodbye!"
  exit
fi

git config user.email animebot.tai.studio@outlook.fr
git config user.name AnimeBack-Bot
git add .
git commit -am "🤖🔄 Update Wallpapers" --author "AnimeBack-Bot <animebot.tai.studio@outlook.fr>"
git pull --rebase
git push origin main
