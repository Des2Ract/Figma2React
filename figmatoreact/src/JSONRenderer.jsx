// src/JSONRenderer.jsx
import React from 'react';
import cn from 'clsx';

import Navbar from './components/Navbar';
import Card   from './components/Card';
import Form   from './components/Form';
import Label  from './components/Label';
import Input  from './components/Input';
import Checkbox from './components/Checkbox';
import Button from './components/Button';
import { List } from './components/List';
import Typography from './components/Typography';

/** helper to read a solid color */
function getColor(fills = []) {
  const f = fills.find(f=>f.type==='SOLID');
  if (!f) return undefined;
  const { r,g,b } = f.color;
  const a = f.opacity ?? 1;
  return `rgba(${r*255},${g*255},${b*255},${a})`;
}

export default function JSONRenderer({ node }) {
  const { tag, node: data, children=[] } = node;

  // --- ROOT FRAME: center everything ---
  if (tag === 'DIV' && data.type === 'FRAME') {
    const pageBg = getColor(data.fills);
    const frameW  = data.width;
    return (
      <div
        className="min-h-screen flex flex-col items-center p-4"
        style={{ backgroundColor: pageBg }}
      >
        {/* Navbar sits at top */}
        <Navbar
          brand={children.find(n=>n.tag==='NAVBAR').children
                   .find(c=>c.tag==='P').node.characters}
          items={
            children
              .find(n=>n.tag==='NAVBAR')
              .children.filter(c=>c.tag==='P').map(c=>c.node.characters).slice(1)
          }
          cta={
            children
              .find(n=>n.tag==='NAVBAR')
              .children.find(c=>c.tag==='BUTTON')
              .children[0].node.characters
          }
          className={cn('w-full', `max-w-[${frameW}px]`)}
        />

        {/* Find the CARD-like frame in your tree */}
        {/** We assume the next FRAME is the sign-in card **/}
        {children
          .filter(n=>n.tag==='DIV' && n.node.type==='FRAME')
          .map((cardNode, i) => (
            <Card
              key={i}
              className={cn('w-full', 'max-w-[410px]', 'mt-8')}
              style={{
                backgroundColor: getColor(cardNode.node.fills),
              }}
            >
              {/* Inside card: render the sign-in form */}
              <Form className="flex flex-col space-y-6">
                {/** Title **/}
                <Typography.Heading size="lg" className="text-center">
                  {cardNode.children.find(c=>c.tag==='P').node.characters}
                </Typography.Heading>

                {/** Username field **/}
                <div className="flex flex-col space-y-1">
                  <Label>{cardNode.children.find(c=>
                    c.tag==='DIV' && c.children.some(ch=>ch.tag==='LABEL')
                  ).children
                    .find(ch=>ch.tag==='LABEL').node.characters
                  }</Label>
                  <Input
                    placeholder={cardNode.children.find(c=>
                      c.tag==='DIV' && c.children.some(ch=>ch.tag==='INPUT')
                    ).children
                      .find(ch=>ch.tag==='INPUT').children[0].node.characters
                    }
                  />
                </div>

                {/** Password field **/}
                <div className="flex flex-col space-y-1">
                  <Label>Password</Label>
                  <Input type="password" />
                </div>

                {/** Terms checkbox **/}
                <div className="flex items-center space-x-2">
                  <Checkbox />
                  <Typography.Text size="sm">
                    Agree to the Terms and Conditions
                  </Typography.Text>
                </div>

                {/** Submit button **/}
                <div className="flex justify-center">
                  <Button variant="primary" size="lg" className="w-full">
                    Sign In
                  </Button>
                </div>

                {/** Footer list **/}
                <List items={['Option 1', 'Option 2']} className="mt-4" />
              </Form>
            </Card>
          ))
        }
      </div>
    );
  }

  // Fallback: if anything unexpected, just recurse
  return (
    <div>
      {children.map((c,i) => <JSONRenderer key={i} node={c} />)}
    </div>
  );
}
