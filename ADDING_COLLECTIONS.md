# 🎯 Adding New Collections - Best Practices

This guide helps you remember to update `CollectionRecords` when adding new types.

## 📋 The Workflow

### Copy-Paste Template

When adding a new collection, use this template:

```typescript
// src/types/pocketbase-types.ts

// Step 1: Define the record type
export interface PostsRecord extends BaseRecord {
  title: string
  content: string
  published: boolean
}

// Step 2: Add to the appropriate collection table
interface AppCollections {
  patients: PatientsRecord
  todos: TodoRecord
  posts: PostsRecord  // ← Add this line!
}

// Step 3: That's it! CollectionRecords automatically includes it via spreading:
// export interface CollectionRecords extends AuthCollections, AppCollections {}
```

### Organized Structure

Collections are now organized into logical tables:

```typescript
// Auth collections
interface AuthCollections {
  users: UsersRecord
}

// Application collections
interface AppCollections {
  patients: PatientsRecord
  todos: TodoRecord
  posts: PostsRecord
  comments: CommentsRecord
}

// All combined automatically
export interface CollectionRecords extends AuthCollections, AppCollections {}
```

## 💡 Why This Can't Be Automatic

**Short answer:** TypeScript's type system works at compile-time and can't scan files.

**Longer answer:**

1. **TypeScript types don't exist at runtime**
   - They're erased when code compiles
   - No way to reflect on them

2. **No automatic file scanning**
   - TypeScript can't discover new interfaces
   - Can't build mappings automatically

3. **The alternatives are worse:**
   - Code generation: Requires build step, another tool
   - Reflection: Doesn't exist in TypeScript
   - Manual everywhere: What we're avoiding!

## ✅ Why Current Approach is Best

### It's Actually Minimal

You already have to define the type:
```typescript
export interface PostsRecord extends BaseRecord {
  title: string
  content: string
}
```

Adding to mapping is **just 1 line**:
```typescript
posts: PostsRecord
```

**This is literally the minimum possible!**

### TypeScript Reminds You

If you forget, you'll quickly notice:

```typescript
// Forgot to add "posts" to CollectionRecords
const posts = useCollection("posts")

// Try to use it:
posts.data?.items[0].title
// ❌ Error! Property 'title' doesn't exist on type 'BaseRecord'
//    👆 This tells you: go add it to CollectionRecords!
```

### Self-Documenting

Collection tables become your collection registry organized by purpose:

```typescript
interface AuthCollections {
  users: UsersRecord       // ✅ Auth collections
}

interface AppCollections {
  patients: PatientsRecord // ✅ App collections
  todos: TodoRecord
}

interface BlogCollections {
  posts: PostsRecord       // ✅ Blog collections
  comments: CommentsRecord
}

// Everything combined automatically
export interface CollectionRecords 
  extends AuthCollections,
          AppCollections, 
          BlogCollections {}
```

**Benefits:**
- Grouped by purpose/feature
- Easy to find related collections
- Scales better with many collections
- Still just 1 line per collection!

## 🛠️ Tools to Help

### VS Code Snippet

Type `pbcollection` in your types file to get:

```typescript
/**
 * CollectionName collection
 */
export interface CollectionNameRecord extends BaseRecord {
  // Add fields here
}

// ⚠️  DON'T FORGET: Add to CollectionRecords below!
// collectionName: CollectionNameRecord
```

### Checklist

When creating a new collection:

- [ ] Define `YourCollectionRecord extends BaseRecord`
- [ ] Add fields to the interface
- [ ] **Immediately** add to appropriate collection table (e.g., `AppCollections`)
- [ ] (Optional) Create a new table if this is a new category of collections
- [ ] Test with `useCollection("yourCollection")`
- [ ] Verify autocomplete works

### Benefits of Table Organization

**Before (flat list):**
```typescript
export interface CollectionRecords {
  users: UsersRecord
  patients: PatientsRecord
  todos: TodoRecord
  posts: PostsRecord
  comments: CommentsRecord
  categories: CategoriesRecord
  tags: TagsRecord
  // Gets messy with many collections...
}
```

**After (organized tables):**
```typescript
interface AuthCollections {
  users: UsersRecord
}

interface AppCollections {
  patients: PatientsRecord
  todos: TodoRecord
}

interface BlogCollections {
  posts: PostsRecord
  comments: CommentsRecord
  categories: CategoriesRecord
  tags: TagsRecord
}

// Clean and organized!
export interface CollectionRecords 
  extends AuthCollections, 
          AppCollections, 
          BlogCollections {}
```

## 🔄 Alternative: Code Generation (Advanced)

If you really want automation, you can use [pocketbase-typegen](https://github.com/patmood/pocketbase-typegen):

```bash
# Install
npm install -D pocketbase-typegen

# Generate types from your PocketBase instance
npx pocketbase-typegen --url http://127.0.0.1:8090
```

**Pros:**
- Generates types from actual DB schema
- Keeps types in sync with PocketBase

**Cons:**
- Need to run command after schema changes
- Another dependency
- Still need to manually maintain `CollectionRecords` mapping

## 📊 Trade-off Summary

| Approach | Manual Work | Complexity | Benefits |
|----------|-------------|------------|----------|
| **Current** | 1 line per collection | Low | Full type safety, simple |
| **Code Gen** | Run script | Medium | Auto-generates from DB |
| **No Mapping** | Type everything manually | Low | No benefits, lots of repetition |

## 🎯 Bottom Line

The `CollectionRecords` mapping is:
- **The smallest possible manual step**
- **Necessary for TypeScript to work**
- **Worth it** for all the automatic type inference you get everywhere else

Think of it as: **"1 line here = ∞ type safety everywhere"**

## 💭 Remember

> You're not avoiding manual work - you're choosing WHERE to do it.
> 
> Option 1: Add 1 line to CollectionRecords (current)
> Option 2: Add `<Type>` to EVERY hook usage (old way)
> 
> Current approach: 1 line once vs 100s of manual types everywhere!

---

**Pro Tip:** Make it a habit - when you create a record type, immediately add it to `CollectionRecords` before moving on. It becomes second nature quickly!
