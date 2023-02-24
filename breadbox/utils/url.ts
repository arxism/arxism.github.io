export const getURLParams = (href: string = window.location.href) => {
  const URL_REG = /https:\/\/fetlife.com\/users\/(\d+)(.*)?/;
  const [userId] = URL_REG.exec(href)?.slice(1) ?? [];
  return {
    userId,
  }
}
